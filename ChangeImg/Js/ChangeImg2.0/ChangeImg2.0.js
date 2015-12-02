/*
* 简单图片切换2.0
* 1.可配置控件大小，显示区大小、隐藏去大小
* 2.可控制箭头大小，箭头颜色
* 注意：
* 1.调用不要在 页面加载完成后执行
* 2.修改切换的显示效果
* 3.添加切换时间  changeTime
*/

(function () {
    var ChangeImg = function (elem, opts) {
        this.elem = elem;
        var defaults = {
            width: 1004,//宽度
            height: 285,//高度
            showWidth: 817,//显示区宽度
            showHeight: 285,//显示区高度
            hideWidth: 175,//隐藏区宽度
            hideHeight: 60,//隐藏区高度
            borderWidth: 4,//隐藏区边框
            borderColor: '#1283D3',//隐藏区边框的颜色
            linkTarget: '_blank',//链接的打开方式
            data: [],// 显示的数据格式列表   （data-options:）必选参数：{ imgurl:'',link:'',title:''}
            changeTime: 400,//切换时间
            auto: true,//是否自动切换
            autoTime: 3000,//自动切换的时间
            onChange: function () { }//切换时的事件
        }
        this.opts = $.extend({}, defaults, opts);
    }
    //定时器
    var timer = null;
 
    ChangeImg.prototype = {
        //初始化样式
        init: function () {
            var _this = this;
            var _elem = this.elem;
            var _opts = this.opts;

            //初始换数据
            _this.initData();
            //初始化文档结构
            _this.initDom();
            //绑定事件
            _this.initEvent();

            //自动切换
            if (_opts.auto) {
                _this.startTimer();
            }
        },
        initData: function () {
            var _this = this;
            var _elem = this.elem;
            var _opts = this.opts;
            var data = _opts.data;

            _elem.children().each(function () {
                var thisItem = $(this);
                var dataItem = thisItem.attr('data-options');
                dataItem = eval('(' + dataItem + ')');
                data.push(dataItem);
            });

            //清空内容
            _elem.empty();
        },
        //初始化文档结构
        initDom: function () {
            var _this = this;
            var _elem = this.elem;
            var _opts = this.opts;
            var data = _this.getData();

            //初始化右侧
            var changeRight = getDiv('changeRight');
            changeRight.css({
                width: _opts.hideWidth
            });
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                //产生项
                var changeItem = getDiv('changeItem');
                changeItem.append(getDiv('changeBack')
                    .append(getImg(item.imgurl, item.title)));
                changeItem.css({
                    width: _opts.hideWidth,
                    height: _opts.hideHeight
                });
                changeItem.attr('data-options', $.toJSON(item));
                changeItem.appendTo(changeRight);
            }
            //初始化左侧
            var changeLeft = getDiv('changeLeft');
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                var leftItem = getDiv('leftItem');
                var aLink = $('<a />');
                aLink.attr('href', item.link).attr('target', _opts.linkTarget);
                aLink.append(getImg(item.imgurl, item.title));
                aLink.appendTo(leftItem);

                changeLeft.append(leftItem);
            }


            changeLeft.css({
                width: _opts.showWidth,
                height: _opts.showHeight
            });

            //容器样式
            _elem.append(changeLeft).append(changeRight).append(getDiv('clear'));
            _elem.css({
                width: _opts.width,
                height: _opts.height
            });

            //样式控制
            _elem.find('.changeItem').first().css({
                marginTop: 0
            });
        },
        //初始化事件绑定
        initEvent: function () {
            var _this = this;
            var _elem = this.elem;
            var _opts = this.opts;
            _elem.mouseenter(function () {
                _this.clearTimer();
            }).mouseleave(function () {
                _this.startTimer();
            });

            //绑定事件
            var itemList = _elem.find('.changeItem');
            var leftList = _elem.find('.leftItem');
            //当前显示编号
            itemList.mouseenter(function () {
                var thisItem = $(this);
                var index = itemList.index(thisItem);
                _elem.attr('data-index', index);
                _this.showIndex();
            });
            _this.showIndex();
        },
        //显示当前项
        showIndex: function () {
            var _this = this;
            var _elem = this.elem;
            var _opts = this.opts;

            //绑定事件
            var itemList = _elem.find('.changeItem');
            var leftList = _elem.find('.leftItem');
            //当前显示编号
            var index = _this.getIndex();
            //隐藏区切换
            var thisItem = itemList.eq(index);
            var changeUp = getDiv('changeUp');
            changeUp.css({
                width: _opts.hideWidth - (_opts.borderWidth * 2),
                height: _opts.hideHeight - (_opts.borderWidth * 2)
            });
            var arrowLeft = getDiv('arrowLeft');
            changeUp.append(arrowLeft);
            arrowLeft.css({
                top: (_opts.hideHeight - _opts.borderWidth * 2 - 10) / 2
            });
            thisItem.append(changeUp);
            thisItem.siblings().find('.changeUp').remove();
            thisItem.find('.changeBack').css({
                opacity: 1
            });
            thisItem.siblings().find('.changeBack').css({
                opacity: 0.5
            });

            //显示区切换
            //切换先显示内容
            var aboveIndex = _this.getAboveIndex();
            var thisLeft = leftList.eq(index);
            thisLeft.show().stop(true, false).animate({
                opacity: 1
            }, _opts.changeTime, function () {
            });
            //其他项隐藏
            thisLeft.siblings().stop().animate({
                opacity: 0
            }, _opts.changeTime, function () {
                $(this).hide();
            });
        },
        //启动定时器
        startTimer: function () {
            var _this = this;
            var _opts = this.opts;
            var _elem = this.elem;
            timer = setInterval(function () {
             
                _elem.attr('data-index', _this.getNextIndex());
                _this.showIndex();
            }, _opts.autoTime);
        },
        //清除定时器
        clearTimer: function () {
            if (timer != null) {
                clearInterval(timer);
            }
        },
        //获取列表数据
        getData: function () {
            return this.opts.data;
        },
        //获取总数量
        getCount: function () {
            return this.getData().length;
        },
        //获取当前显示的索引
        getIndex: function () {
            var index = this.elem.attr('data-index');
           
            if (isNaN(index))
                return 0;
         
            return parseInt(index);
        },
        //获取下一个显示的索引
        getNextIndex: function () {
            var index = this.getIndex();
            index++;
            if (index >= this.getCount())
                index = 0;
            return index;
        },
        //获取上一个索引
        getAboveIndex: function () {
            var index = this.getIndex();
            index--;
            if (index < 0)
                index = this.getCount();
            return index;
        }
    }

    function getDiv(cla) {
        var div = $('<div />');
        div.addClass(cla);
        return div;
    }
    function getImg(src, title) {
        var img = $('<img />');
        img.attr('src', src)
        .attr('alt', title)
        .attr('title', title);
        return img;
    }

    $.fn.changeImg = function (opts) {
        var change = new ChangeImg(this, opts);
        change.init();
        return change;
    }
})();