var Stickit = function(){
    var S = Stickit,
        P = S.prototype,
        NAMESPACE = 'stickit';

    function Stickit(elem, o){
        o = $.extend({}, o);
        this._$elem = $(elem);
        this._$parent = this._$elem.parent();
        this._$parent.css('position', 'relative'); //TODO: REMOVE!
        this._$elem.css('position', 'absolute'); //TODO: REMOVE!
        this._$elem.css({
            transition: 'top 0.4s ease-out 0.1s'
        });
        this._top = o.top != null ? o.top : (this._$elem.css('top') || 0);
        this._left = o.left != null ? o.left : (this._$elem.css('left') || 0);
        this._init();
    }
    P._init = function(){
        var that = this;
        this._$window = $(window);

        function onResize() {
            that._windowHeight = that._$window.height();
        }
        this._$window
            .on('resize.' + NAMESPACE, onResize)
            .on('scroll.' + NAMESPACE, debounce(this._tick, this, 10));
    };
    P._getCoords = function($obj){
        var result = {
            top: $obj === this._$window ? $obj.scrollTop() : $obj.offset().top,
            height: $obj.height()
        };
        result.bottom = result.top + result.height;
        return result;
    };
    P._tick = function(){
        var vpCoords = this._getCoords(this._$window),
            elCoords = this._getCoords(this._$elem),
            parCoords = this._getCoords(this._$parent),
            top;
        //this._$elem.css({
        //    'top': vpCoords.top + 100
        //});

        top = parCoords.top;
        if (top < vpCoords.top) {
            console.log('case 2');
            top = vpCoords.top;
        }
        if ((top + elCoords.height) > vpCoords.bottom) {
            top = vpCoords.bottom - elCoords.height;
            console.log('case 3');
        }
        if (parCoords.bottom < vpCoords.bottom) {
            top = Math.min(parCoords.bottom, vpCoords.bottom) - elCoords.height;
            console.log('case 4');
        }
        top = Math.max(parCoords.top, top);

        console.table([
           ['vpTop', 'vpBottom', 'parTop', 'parBottom', 'elTop', 'elBottom', 'top'],
           [vpCoords.top, vpCoords.bottom, parCoords.top, parCoords.bottom, elCoords.top, elCoords.bottom, top]
        ]);

        top -= parCoords.top;
        this._$elem.css({
            top: top + 'px'
        });
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