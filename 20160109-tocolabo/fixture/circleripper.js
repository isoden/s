
window.CircleRipper = (function () {
  var isTouchable   = 'ontouchend' in document;

  // デバイスに適したイベント名
  var POINTER_START = isTouchable ? 'touchstart' : 'mousedown';
  var POINTER_MOVE  = isTouchable ? 'touchmove'  : 'mousemove';
  var POINTER_END   = isTouchable ? 'touchend'   : 'mouseup';

  // カーソル名
  var MOVE_CURSOR        = 'move';
  var DEFAULT_CURSOR     = 'default';
  var NESW_RESIZE_CURSOR = 'nesw-resize';
  var NWSE_RESIZE_CURSOR = 'nwse-resize';

  // アイコンサイズ
  var MOVEICON_SIZE   = 32;
  var RESIZEICON_SIZE = 32;

  /**
    * @class CircleRipper
    * @constructor
    */
  function CircleRipper() {
    this.init.apply(this, arguments);
  }

  /**
    * 2点間の距離を返却する
    * @static
    * @param  {number} x1 座標
    * @param  {number} y1 座標
    * @param  {number} x2 座標
    * @param  {number} y2 座標
    * @return {number}
    */
  CircleRipper.getDistance = function (x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  /**
    * 拡大率を取得する
    * @static
    * @param  {number} canvasWidth
    * @param  {number} canvasHeight
    * @param  {number} imageWidth
    * @param  {number} imageHeight
    * @return {number}
    */
  CircleRipper.getZoom = function (canvasWidth, canvasHeight, imageWidth, imageHeight) {
    var zoom = 1;

    // 画像サイズが描画エリアよりも大きい場合
    if (canvasWidth < imageWidth || canvasHeight < imageHeight) {
      // widthの方が大きい場合
      if (canvasWidth - imageWidth < canvasHeight - imageHeight) {
        zoom = canvasWidth / imageWidth;
      }

      // heightの方が大きいか、widthとheightが同じ場合
      else {
        zoom = canvasHeight / imageHeight;
      }
    }

    return zoom;
  };

  /**
    * 初期化処理
    * @param {HTMLCanvasElement} el クリップ領域のcanvas
    */
  CircleRipper.prototype.init = function (el) {
    this.canvas        = el;
    this.parentElement = this.canvas.parentElement;

    this.ctx           = this.canvas.getContext('2d');

    this.zoom          = 1;

    this.inMoveCtrl    = false;
    this.inResizeCtrl  = false;

    this.minClipRadius = 25;
    this.clipRadius    = 150;
    this.clipX         = this.canvas.width  / 2;
    this.clipY         = this.canvas.height / 2;

    this.minLimitX     = 0;
    this.minLimitY     = 0;
    this.maxLimitX     = 0;
    this.maxLimitY     = 0;

    this.images        = {};

    this.startX        = 0;
    this.startY        = 0;

    this.degree        = 0;

    this.outputSize   = 300;

    this.setViewport();
    this.subscribeAll();
    this.queue = Promise.all([{name: 'cursor_move', src: './fixture/cursor_move_01.png'}, {name: 'cursor_resize', src: './fixture/cursor_resize_01.png'}].map(function (set, i) {
      return new Promise(function (resolve, reject) {
        var img = document.createElement('img');
        img.addEventListener('load' , resolve, false);
        img.addEventListener('error', reject , false);

        this.images[set.name] = img;
        img.src = set.src;
      }.bind(this));
    }.bind(this)))
  };

  /**
    * クリップ対象の画像を追加する
    * @param {string} urlStr URI文字列
    */
  CircleRipper.prototype.addImage = function (urlStr) {
    var img  = document.createElement('img');

    img.addEventListener('load', function onload() {
      img.removeEventListener('load', onload);

      this.images.target = img;
      this.setup().then(function () {
        this.drawAll();
      }.bind(this));
    }.bind(this));

    img.src = urlStr;
  };

  /**
    * 引数で渡した角度のどれかと現在の角度が一致するかのフラグを返却する
    * @param  {number[]} degrees 角度の配列
    * @return {boolean}
    */
  CircleRipper.prototype.matchDegree = function (degrees) {
    return degrees.indexOf(this.degree) > -1;
  };

  /**
    * キャンバスのサイズを親要素に合わせる
    * @return {void}
    */
  CircleRipper.prototype.setViewport = function () {
    /**
      * @ngdoc foo
      * timeout -> setup -> drawAll
      */
    setTimeout(function () {
      this.canvas.width  = this.parentElement.offsetWidth;
      this.canvas.height = this.parentElement.offsetHeight;
      this.setup();
      this.drawAll();
    }.bind(this), 500);
  };

  /**
    * 全てのオブジェクトを描画する
    * @return {void}
    */
  CircleRipper.prototype.drawAll = function () {
    this.clear();

    var naturalWidth  = this.images.target.naturalWidth;
    var naturalHeight = this.images.target.naturalHeight;

    if (this.matchDegree([-180, 0, 180])) {
      this.zoom = CircleRipper.getZoom(this.canvas.width, this.canvas.height, naturalWidth, naturalHeight);
    } else {
      this.zoom = CircleRipper.getZoom(this.canvas.width, this.canvas.height, naturalHeight, naturalWidth);
    }

    this.drawingWidth  = naturalWidth  * this.zoom;
    this.drawingHeight = naturalHeight * this.zoom;

    this.setLimits();
    this.predraw();
    this.drawTargetImg();
    this.drawFrontface();
    this.drawClipRegion();
    this.drawCtrls();
  };

  /**
    * @return {void}
    */
  CircleRipper.prototype.predraw = function () {
    var clipX = this.clipX;
    var clipY = this.clipY;

    if (this.clipRadius * 2 >= this.drawingWidth || this.clipRadius * 2 >= this.drawingHeight) {
      this.clipRadius = Math.min(this.drawingWidth, this.drawingHeight) / 2;
    }

    if (this.minLimitX >= clipX - this.clipRadius) {
      clipX = this.minLimitX + this.clipRadius;
    }

    if (this.maxLimitX <= clipX + this.clipRadius) {
      clipX = this.maxLimitX - this.clipRadius;
    }


    if (this.minLimitY >= clipY - this.clipRadius) {
      clipY = this.minLimitY + this.clipRadius;
    }

    if (this.maxLimitY <= clipY + this.clipRadius) {
      clipY = this.maxLimitY - this.clipRadius;
    }

    this.clipX = clipX;
    this.clipY = clipY;
  };

  /**
    * 描画の初期化を行う
    */
  CircleRipper.prototype.setup = function () {
    this.degree     = 0;
    this.clipX      = this.canvas.width  / 2;
    this.clipY      = this.canvas.height / 2;
    this.clipRadius = 50;

    return this.queue;
  };

  /**
    * 半透明のカバーを描画する
    * @return {void}
    */
  CircleRipper.prototype.drawFrontface = function () {
    this.ctx.save();
      this.ctx.fillStyle = 'rgba(0, 0, 0, .5)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  };

  /**
    * クリップ対象の画像を描画する
    * @return {void}
    */
  CircleRipper.prototype.drawTargetImg = function () {
    this.ctx.save();
      this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.rotate(this.degree * Math.PI / 180);
      this.ctx.drawImage(this.images.target, - this.drawingWidth / 2, - this.drawingHeight / 2, this.drawingWidth, this.drawingHeight);
    this.ctx.restore();
  };

  /**
    * 画像を回転させる
    * @param  {string} leftOrRight 回転方向を'left'か'right'で指定する
    * @return {void}
    */
  CircleRipper.prototype.rotate = function (leftOrRight) {
    var degree = 0;

    switch (leftOrRight) {
    case 'left':
      degree = -90;
      break;
    case 'right':
      degree = 90;
      break;
    default: break;
    }

    this.degree += degree;

    // 一周したら0に戻す
    if (Math.abs(this.degree) === 360) {
      this.degree = 0;
    }

    this.drawAll();
  };

  /**
    * クリップ領域の移動可能範囲を計算する
    * @return {void}
    */
  CircleRipper.prototype.setLimits = function (width, height) {
    var canvasWidth  = this.canvas.width;
    var canvasHeight = this.canvas.height;
    var drawingWidth;
    var drawingHeight;

    if (this.matchDegree([-180, 0, 180])) {
      drawingWidth = this.drawingWidth;
      drawingHeight = this.drawingHeight
    } else {
      drawingWidth = this.drawingHeight;
      drawingHeight = this.drawingWidth;
    }

    this.minLimitX = canvasWidth  / 2 - drawingWidth  / 2;
    this.minLimitY = canvasHeight / 2 - drawingHeight / 2;
    this.maxLimitX = canvasWidth  / 2 + drawingWidth  / 2;
    this.maxLimitY = canvasHeight / 2 + drawingHeight / 2;
  };

  /**
    * クリップ領域を描画する
    * @return {void}
    */
  CircleRipper.prototype.drawClipRegion = function () {
    // 丸くくり抜く
    this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(this.clipX, this.clipY, this.clipRadius, 0, 360 * Math.PI / 180, false)
      this.ctx.clip();
      this.drawTargetImg();
    this.ctx.restore();

    // クリップ領域に白枠を付ける
    this.ctx.save();
      this.ctx.beginPath();
      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = '#fff';
      this.ctx.arc(this.clipX, this.clipY, this.clipRadius, 0, 360 * Math.PI / 180, false);
      this.ctx.stroke();
    this.ctx.restore();
  };

  /**
    * 移動カーソル、リサイズカーソルを描画する
    * @return {void}
    */
  CircleRipper.prototype.drawCtrls = function () {
    var moveIconSize   = 32;
    var resizeIconSize = 32;

    this.ctx.save();
      this.ctx.drawImage(this.images.cursor_move, this.clipX - moveIconSize / 2, this.clipY - moveIconSize / 2, moveIconSize, moveIconSize);
      this.ctx.drawImage(this.images.cursor_resize, (this.clipX - resizeIconSize / 2) + this.clipRadius / Math.sqrt(2), (this.clipY - resizeIconSize / 2) - this.clipRadius / Math.sqrt(2), resizeIconSize, resizeIconSize);
    this.ctx.restore();
  };

  /**
    * イベントを購読する
    * @return {void}
    */
  CircleRipper.prototype.subscribeAll = function () {
    this.handleStart = this.handleStart.bind(this);
    this.handleMove  = this.handleMove.bind(this);
    this.handleEnd   = this.handleEnd.bind(this);

    this.canvas.addEventListener(POINTER_START, this.handleStart , false);
    window.addEventListener(POINTER_MOVE      , this.handleMove  , false);
    window.addEventListener(POINTER_END       , this.handleEnd   , false);
  };

  /**
    * クリップ領域移動開始時のハンドラー
    * @param  {Event} event イベントオブジェクト
    * @return {void}
    */
  CircleRipper.prototype.handleStart = function (event) {
    var pointer = this.getPointerXY(event);

    // 画像未設定なら終了
    if (!this.images.target) return;

    // クリップ範囲外のクリックは終了
    if (!this.inClipRegion(event) && !this.inResizeRegion(event)) return;

    // リサイズ範囲内の時はフラグを立てる
    if (this.inResizeRegion(event)) {
      this.inResizeCtrl = true;
    }

    // クリップ範囲内の時はフラグを立てる
    else {
      this.inMoveCtrl = true;
    }

    this.startX = pointer.x;
    this.startY = pointer.y;

    this.diffX  = this.startX - this.clipX;
    this.diffY  = this.startY - this.clipY;
  };

  /**
    * クリップ領域移動時のハンドラー
    * @param  {Event} event イベントオブジェクト
    * @return {void}
    */
  CircleRipper.prototype.handleMove = function (event) {
    if (this.images.target && !isTouchable) {
      // タッチデバイス以外の場合はカーソルの見た目を変更する
      this.canvas.style.cursor = this.getCursorName(event);
    }

    if (event.target.tagName !== 'CANVAS') return;

    if (!this.inResizeCtrl && !this.inMoveCtrl) return;

    event.preventDefault();
    var pointer = this.getPointerXY(event);

    if (this.inResizeCtrl) {
      var clipRadius  = CircleRipper.getDistance(this.clipX, this.clipY, this.startX, this.startY);
      this.clipRadius = clipRadius <= this.minClipRadius ? this.clipRadius : clipRadius;
      this.startX = pointer.x;
      this.startY = pointer.y;
    }

    if (this.inMoveCtrl) {
      var clipX = pointer.x - this.diffX;
      var clipY = pointer.y - this.diffY;

      if (clipX - this.clipRadius < this.minLimitX) {
        clipX = this.minLimitX;
      }

      if (clipX + this.clipRadius > this.maxLimitX) {
        clipX = this.maxLimitX;
      }

      if (clipY - this.clipRadius < this.minLimitY) {
        clipY = this.minLimitY;
      }

      if (clipY + this.clipRadius > this.maxLimitY) {
        clipY = this.maxLimitY;
      }

      this.clipX = clipX;
      this.clipY = clipY;

    }

    this.drawAll();
  };

  /**
    * クリップ領域移動終了時のハンドラー
    * @return {void}
    */
  CircleRipper.prototype.handleEnd = function () {
    this.inMoveCtrl   = false;
    this.inResizeCtrl = false;
  };

  /**
    * クリップ領域の画像をdata-uriで返却する
    * @return {string} クリップ領域のURI文字列
    */
  CircleRipper.prototype.export = function () {
    var raw       = document.createElement('canvas');
    var output    = document.createElement('canvas');
    var rawCtx    = raw.getContext('2d');
    var outputCtx = output.getContext('2d');
    var clipSize  = this.clipRadius * 2 / this.zoom;
    var isMatch   = this.matchDegree([-180, 0, 180]);
    var rawWidth  = isMatch ? this.images.target.naturalWidth  : this.images.target.naturalHeight;
    var rawHeight = isMatch ? this.images.target.naturalHeight : this.images.target.naturalWidth;

    raw.width  = rawWidth;
    raw.height = rawHeight;

    rawCtx.translate(rawWidth / 2, rawHeight / 2);
    rawCtx.rotate(this.degree * Math.PI / 180);

    rawCtx.drawImage(
      this.images.target,
      isMatch ? - rawWidth  / 2 : - rawHeight / 2,
      isMatch ? - rawHeight / 2 : - rawWidth  / 2,
      isMatch ? rawWidth        : rawHeight,
      isMatch ? rawHeight       : rawWidth
    );

    output.width = output.height = this.outputSize;
    outputCtx.drawImage(
      raw,
      (this.clipX - this.clipRadius - this.minLimitX) / this.zoom,
      (this.clipY - this.clipRadius - this.minLimitY) / this.zoom,
      clipSize,
      clipSize,
      0,
      0,
      this.outputSize,
      this.outputSize
    );

    return output.toDataURL();
  };

  /**
    * 描画をクリアする
    * @return {void}
    */
  CircleRipper.prototype.clear = function () {
    this.ctx.clearRect(0, 0, this.canvas.width + 1, this.canvas.height + 1);
  };

  /**
    * マウスカーソルがクリップ領域にあるかのフラグを返却する
    * @param  {Event}   event イベントオブジェクト
    * @return {boolean}
    */
  CircleRipper.prototype.inClipRegion = function (event) {
    var pointer = this.getPointerXY(event);
    return this.clipRadius >= CircleRipper.getDistance(this.clipX, this.clipY, pointer.x, pointer.y);
  };

  /**
    * マウスカーソルがリサイズ領域にあるかのフラグを返却する
    * @param  {Event}   event   イベントオブジェクト
    * @return {boolean}
    */
  CircleRipper.prototype.inResizeRegion = function (event) {
    var pointer = this.getPointerXY(event);
    var diff    = this.clipRadius - CircleRipper.getDistance(this.clipX, this.clipY, pointer.x, pointer.y);
    var resizeR = RESIZEICON_SIZE / 2;
    var resizeX = (this.clipX - resizeR) + this.clipRadius / Math.sqrt(2) + resizeR;
    var resizeY = (this.clipY - resizeR) - this.clipRadius / Math.sqrt(2) + resizeR;

    return (diff > -5 && diff < 5) || (resizeR >= CircleRipper.getDistance(resizeX, resizeY, pointer.x, pointer.y));
  };

  /**
    * マウス位置によって適切なcursorプロパティの値を返却する
    * @prop   {Event}  event     イベントオブジェクト
    * @return {string} カーソル名
    */
  CircleRipper.prototype.getCursorName = function (event) {
    var pointer;

    if (!this.inResizeRegion(event)) {
      if (this.inClipRegion(event)) {
        return MOVE_CURSOR;
      }

      return DEFAULT_CURSOR;
    }

    pointer = this.getPointerXY(event);

    if (
      (this.clipX > pointer.x && this.clipY > pointer.y) ||
      (this.clipX < pointer.x && this.clipY < pointer.y)
    ) {
      return NWSE_RESIZE_CURSOR;
    }

    return NESW_RESIZE_CURSOR;
  };

  /**
    * canvas上のポインターの座標を返却する
    * @param {Event} event イベントオブジェクト
    * @return {{x: number, y: number}}
    */
  CircleRipper.prototype.getPointerXY = function (event) {
    var clientX = isTouchable ? event.changedTouches[0].pageX : event.pageX;
    var clientY = isTouchable ? event.changedTouches[0].pageY : event.pageY;
    var offset  = this.getCanvasOffset();

    return {
      x : clientX - offset.left,
      y : clientY - offset.top
    }
  };

  /**
    * canvasの座標を返却する
    * @return {{top: number, left: number}}
    */
  CircleRipper.prototype.getCanvasOffset = function () {
    var rect = this.canvas.getBoundingClientRect();

    return {
      top  : rect.top  + window.pageYOffset,
      left : rect.left + window.pageXOffset
    }
  };

  return CircleRipper;
})();
