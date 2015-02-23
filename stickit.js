var Stickit = function(){
    //transitions support checking code was taken from stackoverflow here:
    //http://stackoverflow.com/questions/7264899/detect-css-transitions-using-javascript-and-without-modernizr
    var TRANSITIONS_SUPPORTED = function(){
        var b = document.body || document.documentElement,
            s = b.style,
            p = 'transition';

        if (typeof s[p] == 'string') { return true; }

        // Tests for vendor specific prop
        var v = ['Moz', 'webkit', 'Webkit', 'Khtml', 'O', 'ms'];
        p = p.charAt(0).toUpperCase() + p.substr(1);

        for (var i=0; i<v.length; i++) {
            if (typeof s[v[i] + p] == 'string') { return true; }
        }

        return false;
    }();

    //TODO: remove console mocking up
    var console = window.console || {
        log: function(){},
        table: function(){}
    };
    console.table = console.table || function(){};

    function supportsTransitions() {
        var b = document.body || document.documentElement,
            s = b.style,
            p = 'transition';

        if (typeof s[p] == 'string') { return true; }

        // Tests for vendor specific prop
        var v = ['Moz', 'webkit', 'Webkit', 'Khtml', 'O', 'ms'];
        p = p.charAt(0).toUpperCase() + p.substr(1);

        for (var i=0; i<v.length; i++) {
            if (typeof s[v[i] + p] == 'string') { return true; }
        }

        return false;
    }

    var S = Stickit,
        P = S.prototype,
        NAMESPACE = 'stickit';

    function Stickit(elem, o){
        o = $.extend({}, o);
        this._$elem = $(elem);
        this._$parent = this._$elem.parent();
        this._$parent.css('position', 'relative'); //TODO: REMOVE!
        this._$elem.css('position', 'absolute'); //TODO: REMOVE!
        this._animationDelay = o.animationDelay != null ? o.animationDelay : 400;
        if (TRANSITIONS_SUPPORTED) {
            //TODO: implement jquery-animate delay too for consistency
            this._$elem.css({
                transition: 'top ' + (this._animationDelay / 1000) + 's ease-out 0.1s'
            });
        }
        this._offsetTop = +o.offsetTop || 0;
        this._offsetBottom = +o.offsetBottom || 0;
        this._top = o.top != null ? o.top : (this._$elem.css('top') || null);
        this._left = o.left != null ? o.left : (this._$elem.css('left') || null);
        this._right = o.right != null ? o.right : (this._$elem.css('right') || null);
        this._init();
    }
    P._init = function(){
        var that = this;
        this._$window = $(window);

        function onResize() {
            that._windowHeight = that._$window.height();
            that._tick();
        }

        this._$window
            .on('resize.' + NAMESPACE, onResize)
            .on('scroll.' + NAMESPACE, debounce(this._tick, this, 10));
    };
    P._getCoords = function($obj){
        var result = {
            top: $obj === this._$window ? $obj.scrollTop() : $obj.offset().top,
            height: $obj.outerHeight($obj === this._$elem)
        };
        result.bottom = result.top + result.height;
        if ($obj === this._$parent) {
            result.rtop = result.top;
            result.rbottom = result.bottom;
            result.top += this._offsetTop;
            result.bottom -= this._offsetBottom;
        }
        return result;
    };
    P._tick = function(){
        var vpCoords = this._getCoords(this._$window),
            elCoords = this._getCoords(this._$elem),
            parCoords = this._getCoords(this._$parent),
            top;

        top = parCoords.top;
        if ((top + elCoords.height) > vpCoords.bottom) {
            top = vpCoords.bottom - elCoords.height;
            console.log('case 3');
        }
        if (top < vpCoords.top) {
            console.log('case 2');
            top = vpCoords.top;
        }
        if (parCoords.bottom < vpCoords.bottom) {
            top = Math.min(parCoords.bottom - elCoords.height, top);
            console.log('case 4');
        }
        top = Math.max(parCoords.top, top);

        console.table([
           ['vpTop', 'vpBottom', 'parTop', 'parBottom', 'elTop', 'elBottom', 'top'],
           [vpCoords.top, vpCoords.bottom, parCoords.top, parCoords.bottom, elCoords.top, elCoords.bottom, top]
        ]);

        top -= parCoords.rtop;
        var css = {
            top: top + 'px',
            left: this._left,
            right: this._right
        };

        if (TRANSITIONS_SUPPORTED) {
            this._$elem.css(css);
        } else {
            this._$elem.stop().animate(css, {
                duration: 400
            });
        }
    };

    function debounce(func, context, delay){
        var lastTime,
            hasContext;
        if (delay == null) {
            delay = context;
            context = void(0);
        }
        hasContext = context !== void(0);
        return function(){
            var now = +(new Date);
            if (lastTime == null || (now - lastTime) >= delay) {
                lastTime = now;
                return func.apply(hasContext ? context : this, arguments)
            }
        };
    }

    return Stickit;
}();