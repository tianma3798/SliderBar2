//页面切换封装
//version 1.0
(function ($) {

    var SilderPage = function (elem, opts) {
        var defaults = {
            count: 0,//当前容器内 页面数量
            loopRun: true,//指定是否可以循环滚动
            width: '100%',//宽度
            height: '100%',//高度
            showBtn: true,//指定是否左右按钮
            leftHandler: function (index) {

            },//左滑动事件
            rightHandler: function (index) {

            },//右滑动事件
            //左滑动到头事件
            leftEndHandler: function (index) {
                alert('亲，现在是第一页了哦');
            },
            //右滑动到头事件
            rightEndHandler: function (index) {
                alert('亲，现在是最后一页哦,开始分享吧');
            }
        }
        this.opts = $.extend({}, defaults, opts);
        this.elem = elem;
    }
    function getDivByClass(cls) {
        var div = $('<div />');
        div.addClass(cls);
        return div;
    }

    //  var flag = 0;//表示是否可移动

    SilderPage.prototype = {
        //初始换
        init: function () {
            var _this = this;
            var _opts = this.opts;
            var _elem = this.elem;

            //1.初始化页面设置
            var pageList = _this.getPageList();
            pageList.first().removeClass('hidePage');
            pageList.first().siblings().addClass('hidePage');
            _opts.count = pageList.length;
            // 初始化panel
            _this.initPanel();
            // 初始化按钮
            _this.initBtn();

            //初始化事件
            _elem.on('swipeleft', function () {
                _this.showNext();
            }).on('swiperight', function () {
                _this.showAbove();
            });

        },
        //初始化panel
        initPanel: function () {
            var _elem = this.elem;
            var _opts = this.opts;
            _elem.css('width', _opts.width)
            .css('height', _opts.height);

            var pageList = this.getPageList();
            pageList.css('width', _opts.width).css('height', _opts.height);
        },
        //初始化 按钮
        initBtn: function () {
            var _this = this;
            var _elem = this.elem;
            var _opts = this.opts;
            if (_opts.showBtn) {
                var pageBtn = getDivByClass('pageBtn');
                var leftBtn = getDivByClass('leftBtn');
                var rightBtn = getDivByClass('rightBtn');
                //追加到文档
                pageBtn.append(leftBtn).append(rightBtn);
                _elem.append(pageBtn);

                var height = _elem.height();
                //var height = $(window).height();
                var btnTop = (height - leftBtn.height()) / 2;
                leftBtn.text('<').css({
                    top: btnTop
                });
                leftBtn.on('click', function () {
                    _this.showNext();
                });

                rightBtn.text('>').css({
                    top: btnTop
                });
                rightBtn.on('click', function () {
                    _this.showAbove();
                });
            }
        },
        //初始化按钮
        //显示上一页
        showAbove: function () {
            var _this = this;
            var _elem = this.elem;
            var _opts = this.opts;
            var pageList = _this.getPageList();
            var index = _this.getCurrentIndex();
            var aboveIndex = _this.getAboveIndex();
            var current = pageList.eq(index);
            var above = pageList.eq(aboveIndex);
            //判断是否到了最左侧
            if (_opts.loopRun == false) {
                if (index == 0) {
                    _opts.leftEndHandler(index);
                    return;
                }
            }

            //当前页和上一页 同事右滚动
            var width = _elem.width();
            var rightBtn = _this.getRightBtn();
            rightBtn.off('click');
            //当前页又滚
            current.stop(true, true).animate({
                left: width
            }, 'slow', function () {
                current.css({
                    left: 0
                }).addClass('hidePage');

                rightBtn.on('click', function () {
                    _this.showAbove();
                });
            });
            //上一页又滚
            above.css({
                left: -width
            }).removeClass('hidePage');
            above.stop(true, true).animate({
                left: 0
            }, 'slow', function () {

            });
            //设置结果和事件
            _elem.attr('data-index', aboveIndex);
            if (_opts.rightHandler) {
                _opts.rightHandler(index);
            }
        },
        //显示下一页
        showNext: function () {
            var _this = this;
            var _elem = this.elem;
            var _opts = this.opts;
            var pageList = _this.getPageList();
            var index = _this.getCurrentIndex();
            var nextIndex = _this.getNextIndex();
            var current = pageList.eq(index);
            var next = pageList.eq(nextIndex);


            //判断是否到了最左侧
            if (_opts.loopRun == false) {
                if (index == _opts.count - 1) {
                    _opts.rightEndHandler(index);
                    return;
                }
            }

            //当前页和上一页 同事右滚动
            var width = _elem.width();
            var leftBtn = _this.getLeftBtn();
            leftBtn.off('click');
            //当前页又滚
            current.stop(true, true).animate({
                left: -width
            }, 'slow', function () {
                current.css({
                    left: 0
                }).addClass('hidePage');

                leftBtn.on('click', function () {
                    _this.showNext();
                });
            });
            //上一页又滚
            next.css({
                left: width
            }).removeClass('hidePage');
            next.stop(true, true).animate({
                left: 0
            }, 'slow', function () {

            });
            //设置结果和事件
            _elem.attr('data-index', nextIndex);
            if (_opts.leftHandler) {
                _opts.leftHandler(index);
            }
        },
        //获取当前显示页对象
        getCurrentPage: function () {
            return this.getPageList().filter(':not(.hidePage)');
        },
        //获取当前显示页索引
        getCurrentIndex: function () {
            var index = this.elem.attr('data-index');
            if (index == undefined || index == null) {
                index = 0;
            }
            return index;
        },
        //获取上一页索引
        getAboveIndex: function () {
            var index = this.getCurrentIndex();
            index--;
            var count = this.opts.count;
            if (index < 0)
                return count - 1;
            return index;
        },
        //获取下一页 索引
        getNextIndex: function () {
            var index = this.getCurrentIndex();
            index++;
            var count = this.opts.count;
            if (index == count)
                return 0;
            return index;
        },
        //获取pageList
        getPageList: function () {
            return this.elem.find('.sliderPage');
        },
        //获取左侧按钮
        getLeftBtn: function () {
            return this.elem.find('.leftBtn');
        },
        //获取右侧按钮
        getRightBtn: function () {
            return this.elem.find('.rightBtn');
        }
    }

    $.fn.sliderPage = function (opts) {
        var page = new SilderPage(this, opts);
        page.init();
        return page;
    }
})(jQuery);
