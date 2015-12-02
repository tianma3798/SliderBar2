/// <reference path="../Js/jquery-1.8.2.js" />

/*
* 简单图片切换1.0
* 1.可配置控件大小，显示区大小、隐藏去大小
* 2.可控制箭头大小，箭头颜色
* 注意：
* 1.调用不要在 页面加载完成后执行
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
            auto: true,//是否自动切换
            time: 6000,//自动切换的时间
            onChange: function () { }//切换时的事件
        }
        this.opts = $.extend({}, defaults, opts);
    }

    //定时器
    var timer = null;
    //当前显示编号
    var index = 0;
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
            var aLink = $('<a />');
            aLink.attr('href', item.link).attr('target', _opts.linkTarget);
            aLink.append(getImg(item.imgurl, item.title));
            aLink.appendTo(changeLeft);
            changeLeft.css({
                width: _opts.showWidth,
                height: _opts.showHeight
            });

            //内容
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
            itemList.mouseenter(function () {
                var thisItem = $(this);

                //隐藏区切换
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
                //1.链接切换
                var showImg = _elem.find('.changeLeft img');
                var itemData = thisItem.attr('data-options');
                itemData = eval('(' + itemData + ')');
                showImg.parent().attr('href', itemData.link);
                //2.图片切换
                var imgUrl = itemData.imgurl;
                showImg.stop(true, false).animate({
                    opacity: 0.2
                }, 250, function () {
                    showImg.attr('src', imgUrl).animate({
                        opacity: 0.8
                    }, 150).animate({
                        opacity: 1
                    }, 150);
                });

                index = itemList.index(thisItem);
            });
            _elem.find('.changeItem').first().trigger('mouseenter');
        },
        //启动定时器
        startTimer: function () {
            var _this = this;
            var _opts = this.opts;
            var _elem = this.elem;


            timer = setInterval(function () {
                var itemList = _elem.find('.changeItem');
                index++;
                if (index >= itemList.length)
                    index = 0;
                itemList.eq(index).trigger('mouseenter');
            }, _opts.time);

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