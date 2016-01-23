setTimeout(() => {

  'use strict';
  new SkewSlider({
    el       : document.getElementById('rx-write1'),
    angle    : 15,
    interval : 3000,
    duration : 1000,
    sources  : [
      './fixture/slide1.jpg',
      './fixture/slide2.jpg',
      './fixture/slide3.jpg'
    ]
  });

  var mountNode = document.getElementById('rx-write2');
  var ripper    = new CircleRipper(mountNode);

  // デフォルト画像の設定
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'fixture/data-url.txt');
  xhr.addEventListener('load', function loadXhr() {
    xhr.removeEventListener('load', loadXhr);
    ripper.addImage(xhr.responseText);
  });
  xhr.send();

  ;(() => {
    // ブレンドモードのデモ

    [
      'normal'          , 'multiply'     , 'screen'    , 'overlay'        , 'darken',
      'lighten'         , 'color-dodge'  , 'color-burn', 'hard-light'     , 'soft-light',
      'difference'      , 'exclusion'    , 'hue'       , 'saturation'     , 'color',
      'luminosity'      ,'clear'         , 'copy'      , 'source-over'    , 'destination-over',
      'source-in'       ,'destination-in', 'source-out', 'destination-out', 'source-atop'     ,
      'destination-atop', 'xor'          , 'lighter'
    ].forEach(function (operationName, i) {
      var ctxBlend = document.getElementById('ex-blend' + (1 + i)).getContext('2d');

      ctxBlend.fillStyle = 'rgba(0, 0, 255, .6)';
      ctxBlend.fillRect(10, 10, 60, 60);
      ctxBlend.globalCompositeOperation = operationName;
      ctxBlend.fillStyle = 'rgba(255, 0, 0, .6)';
      ctxBlend.fillRect(30, 30, 60, 60);
    });

    // // 画像のデモ
    //
    // 'use strict';
    //
    // var ctxImg01 = document.getElementById('ex-image01').getContext('2d');
    // var image = document.createElement('img');
    // ctxImg01.canvas.height = 200;
    // image.addEventListener('load', function () {
    //   ctxImg01.drawImage(image, 30, 30, 200, 150);
    // }, false);
    // image.src = 'image-fixture01.jpg';

    // var renderingCtx = document.getElementById('ex-rect01').getContext('2d');
    // renderingCtx.arc(220, 80, 20, 0, 360 * Math.PI / 180);
    // renderingCtx.fill();

  })();

  ;(() => {
    var ctx = document.getElementById('ex-arc1').getContext('2d');
    ctx.strokeStyle = 'orange';
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.arc(220, 80, 20, 0, 360 * Math.PI / 180);
    ctx.stroke();
  })();

  ;(() => {
    var ctx = document.getElementById('ex-arc2').getContext('2d');
    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.arc(220, 80, 20, 0, 360 * Math.PI / 180);
    ctx.fill();
  })();

  ;(() => {
    var ctxAnim1    = document.getElementById('ex-animation1').getContext('2d');
    var ctxAnimBtn1 = document.getElementById('ex-animation1-run1');
    var ctxAnimBtn2 = document.getElementById('ex-animation1-run2');
    var pos         = {x: 0, y: ctxAnim1.canvas.height / 2 - 30};
    var animationId = null;

    function init() {
      cancelAnimationFrame(animationId);
      ctxAnim1.clearRect(0, 0, ctxAnim1.canvas.width, ctxAnim1.canvas.height);
      pos = {x: 0, y: ctxAnim1.canvas.height / 2 - 30};
    }

    function drawExAnim(clear) {
      if (clear) {
        ctxAnim1.clearRect(0, 0, ctxAnim1.canvas.width, ctxAnim1.canvas.height);
      }

      drawRect();

      pos.x += 2;

      if (pos.x < ctxAnim1.canvas.width - 60) {
        animationId = requestAnimationFrame(function () {
          drawExAnim(clear);
        });
      }
    }

    function drawRect() {
      ctxAnim1.save();
        ctxAnim1.fillStyle = '#f33';
        ctxAnim1.fillRect(pos.x, pos.y, 60, 60);
      ctxAnim1.restore();
    }

    drawRect();

    ctxAnimBtn1.addEventListener('click', function () {
      init();
      drawExAnim(true);
    });

    ctxAnimBtn2.addEventListener('click', function () {
      init();
      drawExAnim(false);
    });

  })();

  ;(() => {
    var ctx  = document.getElementById('ex-anim1').getContext('2d');
    var run1 = document.getElementById('ex-anim1-run');
    var run2 = document.getElementById('ex-anim1-run2');
    var run3 = document.getElementById('ex-anim1-run3');

    var moveValue = 20;
    var delay     = 500;

    var circle = {
      x   : 0,
      y   : ctx.canvas.height / 2 - 20,
      size: 60
    };

    var animationId = null;

    function animate() {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      drawCircle();

      circle.x += moveValue;

      if (circle.x < ctx.canvas.width - circle.size) {
        animationId = setTimeout(animate, delay);
      }
    }

    function drawCircle() {
      ctx.save();
        ctx.fillStyle = '#f33';
        ctx.fillRect(circle.x, circle.y, circle.size, circle.size);
      ctx.restore();
    }

    drawCircle();

    run1.addEventListener('click', () => {
      cancelAnimationFrame(animationId);
      circle.x = 0;
      moveValue = 20;
      delay     = 500;
      animate();
    }, false);

    run2.addEventListener('click', () => {
      cancelAnimationFrame(animationId);

      circle.x = 0;
      moveValue = 4;
      delay     = 1000 / 15;

      animate()
    }, false);

    run3.addEventListener('click', () => {
      cancelAnimationFrame(animationId);

      circle.x = 0;
      moveValue = 1.5;
      delay     = 1000 / 60;

      animate();
    }, false);
  })();

  ;(() => {
    var ctx = document.getElementById('ex-rect4').getContext('2d');
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 0, 0, .5)'
    ctx.moveTo(140, 70);
    ctx.lineTo(190, 70);
    ctx.lineTo(190, 120);
    ctx.lineTo(140, 120);
    ctx.closePath();
    ctx.stroke();
  })();

  ;(() => {
    var ctx = document.getElementById('ex-rect1').getContext('2d');
    ctx.fillRect(140, 70, 50, 50)
  })();

  ;(() => {
    var ctx = document.getElementById('ex-rect6').getContext('2d');
    ctx.fillStyle = 'orange';
    ctx.fillRect(140, 70, 50, 50)
  })();

  ;(() => {
    var ctx = document.getElementById('ex-rect5').getContext('2d');
    ctx.fillRect(140, 70, 50, 50)
  })();

  ;(() => {
    var ctx = document.getElementById('ex-up1').getContext('2d');
    var circle = {};

    circle.x = 10;
    circle.y = 10;
    circle.vx = 20;
    circle.vy = 15;
    circle.radius = 20;

    setTimeout(function animate() {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      if (circle.x >= ctx.canvas.width || circle.y >= ctx.canvas.height) {
        circle.x = circle.y = 10;
      }

      circle.x += circle.vx;
      circle.y += circle.vy;

      ctx.save();
        ctx.beginPath();
        ctx.fillStyle = 'orange';
        ctx.arc(circle.x, circle.y, circle.radius, 0, 360 * Math.PI / 180);
        ctx.fill();
      ctx.restore();

      ctx.font = '30px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`(${circle.x}, ${circle.y})`, ctx.canvas.width - 10, ctx.canvas.height - 10);

      setTimeout(animate, 800);
    });
  })();

  ;(() => {
    var ctx = document.getElementById('ex-up2').getContext('2d');
    var circle = {};

    circle.x      = 30;
    circle.y      = 30;
    circle.vx     = 4;
    circle.vy     = 3;
    circle.radius = 20;

    requestAnimationFrame(function animate() {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      if (circle.x <= circle.radius || circle.x >= ctx.canvas.width - circle.radius) {
        circle.vx *= -1;
      }
      if (circle.y <= circle.radius || circle.y >= ctx.canvas.height - circle.radius) {
        circle.vy *= -1;
      }

      circle.x += circle.vx;
      circle.y += circle.vy;

      ctx.save();
        ctx.beginPath();
        ctx.fillStyle = 'orange';
        ctx.arc(circle.x, circle.y, circle.radius, 0, 360 * Math.PI / 180);
        ctx.fill();
      ctx.restore();

      ctx.font = '30px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`vx = ${circle.vx}`, ctx.canvas.width - 10, ctx.canvas.height - 40);
      ctx.fillText(`vy = ${circle.vy}`, ctx.canvas.width - 10, ctx.canvas.height - 10);

      requestAnimationFrame(animate);
    });
  })();

  ;(() => {
    var ctx = document.getElementById('ex-hit1').getContext('2d');

    ctx.fillStyle = 'LightGreen';
    ctx.fillRect(40, 40, 40, 40);

    ctx.fillStyle = 'LightCoral';
    ctx.fillRect(420, 180, 40, 80);

    ctx.fillStyle = 'LightBlue';
    ctx.arc(180, 200, 30, 0, 360 * Math.PI / 180, false);
    ctx.fill();
  })();

  ;(() => {
    var ctx = document.getElementById('ex-hit2').getContext('2d');

    ctx.fillStyle = 'LightGreen';
    ctx.fillRect(40, 40, 40, 40);

    ctx.fillStyle = 'LightCoral';
    ctx.fillRect(420, 180, 40, 80);

    ctx.fillStyle = 'LightBlue';
    ctx.arc(180, 200, 30, 0, 360 * Math.PI / 180, false);
    ctx.fill();
  })();

  ;(() => {
    var ctx = document.getElementById('ex-hit3').getContext('2d');

    ctx.fillStyle = 'LightGreen';
    ctx.fillRect(40, 40, 40, 40);

    ctx.fillStyle = 'LightCoral';
    ctx.fillRect(420, 180, 40, 80);

    ctx.fillStyle = 'LightBlue';
    ctx.arc(180, 200, 30, 0, 360 * Math.PI / 180, false);
    ctx.fill();
  })();

  ;(() => {
    var ctx = document.getElementById('ex-rect2').getContext('2d');
    ctx.fillRect(140, 70, 50, 50);
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    function arrayIncludes(array, target) {
      return array.some(v => v === target);
    }

    ctx.lineWidth = 4;

    for (var x = 0; x < ctx.canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x + .5, .5);
      ctx.lineTo(x + .5, 10.5);
      ctx.closePath();
      ctx.stroke();
      if (x && x % 40 === 0) {
        ctx.fillText(x, x, 14);
      }
    }

    ctx.textBaseline = 'middle';

    for (var y = 0; y < ctx.canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(.5, y + .5);
      ctx.lineTo(10.5, y + .5);
      ctx.closePath();
      ctx.stroke();
      if (y && y % 40 === 0) {
        ctx.fillText(y, 30, y);
      }
    }
  })();

  ;(() => {
    var ctx = document.getElementById('ex-rect3').getContext('2d');
    var dashLineOffset = 0;

    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    function arrayIncludes(array, target) {
      return array.some(v => v === target);
    }


    requestAnimationFrame(function animate() {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillRect(140, 70, 50, 50);

      ctx.save();
        ctx.strokeStyle = 'rgba(255, 0, 0, .8)';
        ctx.lineDashOffset = dashLineOffset -= .2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(140 + .5, 0 + .5);
        ctx.lineTo(140 + .5, 70 + .5);
        ctx.moveTo(0 + .5, 70 + .5);
        ctx.lineTo(140 + .5, 70 + .5);
        ctx.stroke();
      ctx.restore();

      ctx.lineWidth = 4;
      ctx.save();
        for (var x = 0; x < ctx.canvas.width; x += 20) {
          ctx.beginPath();
          ctx.moveTo(x + .5, .5);
          ctx.lineTo(x + .5, 10.5);
          ctx.closePath();
          ctx.stroke();
          if (x && x % 40 === 0) {
            ctx.fillText(x, x, 14);
          }
        }

        ctx.textBaseline = 'middle';

        for (var y = 0; y < ctx.canvas.height; y += 20) {
          ctx.beginPath();
          ctx.moveTo(.5, y + .5);
          ctx.lineTo(10.5, y + .5);
          ctx.closePath();
          ctx.stroke();
          if (y && y % 40 === 0) {
            ctx.fillText(y, 30, y);
          }
        }
      ctx.restore();
      requestAnimationFrame(animate);
    });
  })();

  ;(() => {
    var ctx = document.getElementById('ex-ph1').getContext('2d');

    class Circle {
      static isCollision(circleA, circleB) {
        return (circleB.x - circleA.x) * (circleB.x - circleA.x) + (circleB.y - circleA.y) * (circleB.y - circleA.y) < (circleA.radius + circleB.radius) * (circleA.radius + circleB.radius);
      }

      static refrect(circleA, circleB) {
        var vx = circleB.x - circleA.x;
        var vy = circleB.y - circleA.y;
        var tmp;

        tmp = -(vx * circleA.dx + vy * circleA.dy) / (vx * vx + vy * vy);
        var arx = circleA.dx + vx * tmp;
        var ary = circleA.dy + vy * tmp;

        tmp = -(-vy * circleA.dx + vx * circleA.dy) / (vy * vy + vx * vx);
        var amx = circleA.dx - vy * tmp;
        var amy = circleA.dy + vx * tmp;

        tmp = -(vx * circleB.dx + vy * circleB.dy) / (vx * vx + vy * vy);
        var brx = circleB.dx + vx * tmp;
        var bry = circleB.dy + vy * tmp;

        tmp = -(-vy * circleB.dx + vx * circleB.dy) / (vy * vy + vx * vx);
        var bmx = circleB.dx - vy * tmp;
        var bmy = circleB.dy + vx * tmp;

        var e = 1.0;
        var adx = (amx + bmx + bmx * e - amx * e) / 2;
        var bdx = - e * (bmx - amx) + adx;
        var ady = (amy + bmy + bmy * e - amy * e) / 2;
        var bdy = - e * (bmy - amy) + ady;

        circleA.dx = adx + arx;
        circleA.dy = ady + ary;
        circleB.dx = bdx + brx;
        circleB.dy = bdy + bry;
      }

      constructor(x, y, dx, dy) {
        this.x      = x;
        this.y      = y;
        this.dx     = dx;
        this.dy     = dy;
        this.radius = 60;
        this.color  = '#333';
      }
      render(ctx) {
        ctx.save();
          ctx.beginPath();
          ctx.fillStyle = this.color;
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
          ctx.fill()
        ctx.restore();
      }
      update() {
        this.x += this.dx;
        this.y += this.dy;

        if (this.x <= this.radius || this.x >= ctx.canvas.width - this.radius) {
          this.dx *= -1;
        }

        if (this.y <= this.radius || this.y >= ctx.canvas.height - this.radius) {
          this.dy *= -1;
        }
      }
    }

    var circles = [];

    circles.push(new Circle(100, 200, 5, 2));
    circles.push(new Circle(400, 80, 3, 5));

    circles.forEach(function (circle) {
      circle.render(ctx);
    });

    //
    document.getElementById('ex-ph1-run').addEventListener('click', function animate() {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      circles.forEach(function (circle) {
        circle.update();
        circle.render(ctx);
      });

      // 衝突したら反射する
      if (Circle.isCollision(circles[0], circles[1])) {
        Circle.refrect(circles[0], circles[1]);
      }

      requestAnimationFrame(animate);
    }, false);


  })();
}, 1000);
