
/*
* 简单滑块切换 2.0
*/
/*
*1.解决多滑块 切换 bug
*2.代码重构
*3.添加上下切换方式
*/
(function ($) {
    //滑块类声明
    //var timer;//自动滚动的计时器变量
    var SliderBar = function (elem, opts) {
        var _this = this;
        this.elem = elem;
        //默认参数设置
        var defaults = {
            width: 800,//外部容器的宽和高
            height: 300,
            containerWidth: 450,//内部容器的宽和高
            containerHeight: 200,
            itemWidth: 450,//每一项的宽和高
            itemHeight: 200,
            displayCount: 1,//默认一组显示的个数
            btnHorizontalMargin: 20,//切换按钮 距离两边的距离
            markingSite: 'center',//标示按钮位置 'center':居中,left:居左,right:居右
            markingType: 'number',//标示按钮的类型，默认number，还有circle,square
            markingMarginBottom: 10,//标示按钮到底部的距离

            showType: 'horizontal',//指定切换方式,horizontal:水平切换，vertical:垂直切换,opacity:渐变切换
            showTime: 1000,//指定 切换的时间间隔
            showBtn: true,//指定是否显示切换按钮
            showMarking: true,//是否显示 标示按钮:数字按钮，圆圈按钮
            loopRun: false,//指示是否循环播放
            autoRun: false, //指明是否自动滚动 
            autoRunTime: 2500//指定 自动滚动时间间隔
        }
        //根据切换类型，设置切换的间隔
        if (defaults.showType == 'opacity') {
            defaults.showTime = 300;
        }

        this.opts = $.extend({}, defaults, opts);
    }
    //var timer;//自动滚动的计时器变量
    SliderBar.prototype.timer = undefined;

    //滑块类 方法
    SliderBar.prototype = {
        /*****对外可见方法*****/
        init: function () {
            var _elem = this.elem;
            var _opts = this.opts;
            var _this = this;
            //1.外部容器样式控制
            initOuter();
            //2.内部容器样式控制
            initInner();
            //3.切换按钮
            if (_opts.showBtn)
                initBtn();
            else {
                _elem.remove('.leftBtn').remove('.rightBtn');
            }
            //4.标示按钮---当displayCount=1 时显示
            if (_opts.showMarking && _opts.displayCount == 1)
                initMarkingBtn();
            else {
                _elem.remove('.num');
            }
            //5.初始化定时器 设置
            if (_opts.autoRun)
                _this.autoRunStart();

            //外部容器
            function initOuter() {
                //宽度高度
                _elem.width(_opts.width).height(_opts.height);
            }
            //内部容器
            function initInner() {
                //宽度高度，位置
                var inner = _elem.find('.sliderContainer');
                inner.css('width', _opts.containerWidth).css('height', _opts.containerHeight);
                var vTop = (_elem.height() - inner.height()) / 2;
                inner.css({ top: vTop });

                //显示行 样式
                var slider = _elem.find('.slider');
                var liList = slider.find('li');
                if (_opts.showType == 'horizontal') {
                    var hWidth = liList.length * _opts.itemWidth;
                    slider.width(hWidth);
                } else if (_opts.showType == 'vertical') {
                    var vHeight = liList.length * _opts.itemHeight;
                    slider.height(vHeight);
                } else if (_opts.showType == 'opacity') {
                    liList.css({
                        position: 'absolute'
                    });
                    liList.fadeTo(0, 0);
                    liList.first().fadeTo(0, 1);
                }
                //单项样式
                liList.width(_opts.itemWidth).height(_opts.itemHeight);
            }
            //切换按钮
            function initBtn() {
                //左按钮
                _elem.remove('.leftBtn').append('<div class="leftBtn btn"/>');
                var leftBtn = _elem.find('.leftBtn');
                var btnTop = (_elem.height() - leftBtn.height()) / 2;
                leftBtn.css({
                    top: btnTop,
                    left: _opts.btnHorizontalMargin
                });
                leftBtn.click(function () {
                    _this.leftRun();
                }).hover(function () {
                    _this.autoRunStop();
                    leftBtn.addClass('backDiv-hover');
                }, function () {
                    _this.autoRunStart();
                    leftBtn.removeClass('backDiv-hover');
                });
                leftBtn.remove('.backDiv').append('<div class="backDiv"/>');
                leftBtn.remove('.imgDiv').append('<div class="imgDiv"/>');
                //右按钮
                _elem.remove('.rightBtn').append('<div class="rightBtn btn"/>');
                var rightBtn = _elem.find('.rightBtn');
                rightBtn.css({
                    top: btnTop,
                    right: _opts.btnHorizontalMargin
                }).click(function () {
                    _this.righRun();
                }).mouseenter(function () {
                    _this.autoRunStop();
                    rightBtn.addClass('backDiv-hover');
                }).mouseleave(function () {
                    _this.autoRunStart();
                    rightBtn.removeClass('backDiv-hover');
                });
                rightBtn.remove('.backDiv').append('<div class="backDiv"/>');
                rightBtn.remove('.imgDiv').append('<div class="imgDiv"/>');
            }
            //切换标示按钮
            function initMarkingBtn() {
                //1.创建按钮
                var inner = _elem.find('.sliderContainer');
                var slider = inner.find('.slider');
                var liList = slider.find('li');

                inner.remove('.num').append('<ul class="num"/>');
                var num = inner.find('.num');
                for (var i = 1; i <= liList.length; i++) {
                    var li = $('<li />');
                    if (i == 1)
                        li.addClass('hot');
                    li.text(i);
                    num.append(li);
                }
                //设置切换按钮样式
                if (_opts.markingType == 'number') {
                    num.addClass('number');
                } else if (_opts.markingType == 'circle') {
                    num.addClass('circle');
                }

                //设置标示按钮位置
                if (_opts.markingSite == 'center') {
                    var left = (inner.width() - num.width()) / 2;
                    num.css({ left: left });
                } else if (_opts.markingSite == 'left') {
                    num.css({
                        left: 20
                    });
                } else {
                    num.css({
                        right: 20
                    });
                }
                num.css({
                    bottom: _opts.markingMarginBottom
                });
                //绑定按钮事件
                _this.bindMarkingEvent();
            }
        },
        //获取当前活动项 索引
        getIndex: function () {
            return parseInt(this.elem.attr('data-index'));
        },
        //获取当前项数量
        getCount: function () {
            return this.elem.find('.slider li').length;
        },
        //获取当前组数/页数
        getPageCount: function () {
            var count = this.getCount();
            return Math.ceil(count / this.opts.displayCount);
        },
        /*****内部使用方法*****/
        //滑动到当前索引图片
        showImg_Index: function () {
            var _elem = this.elem;
            var _opts = this.opts;
            var index = this.getIndex();
            //1.slider 滑动
            var slider = _elem.find('.slider');
            //水平切换
            if (_opts.showType == 'horizontal') {
                slider.stop(true, false).animate({
                    left: -index * _opts.itemWidth * _opts.displayCount
                }, _opts.showTime, 'swing');
            } else if (_opts.showType == 'vertical') {
                slider.stop(true, false).animate({
                    top: -index * _opts.itemHeight * _opts.displayCount
                }, _opts.showTime, 'swing');
            } else if (_opts.showType == 'opacity') {
                var currentLi = slider.find('li').eq(index);
                currentLi.show().stop(true, false)
                    .animate({ opacity: 1 }, _opts.showTime, function () {
                    });
                var siblingsLi = currentLi.siblings();
                siblingsLi.stop(true, false)
                    .animate({ opacity: 0 }, _opts.showTime, function () {
                        siblingsLi.hide();
                    });
            }
            //2. 数字按钮变化
            if (_opts.showMarking) {
                var num = _elem.find('.num');
                num.find('li').removeClass('hot').eq(index).addClass('hot');
            }
        },
        //设置当前索引，并制定是否滚动图片
        setIndex: function (index, isNotRun) {
            this.elem.attr('data-index', index);
            if (isNotRun == undefined && isNotRun == true)
                return;
            this.showImg_Index();
        },
        //绑定按钮事件
        bindMarkingEvent: function () {
            var _this = this;
            var liList = this.elem.find('.num li');
            //鼠标经过事件
            liList.hover(function () {
                _this.autoRunStop();
                var index = liList.index($(this));
                _this.setIndex(index);
            }, function () {
                _this.autoRunStart();
            });
        },
        //停止自动滚动
        autoRunStop: function () {
            if (this.timer)
                clearInterval(this.timer);
        },
        //启动自动滚动
        autoRunStart: function () {
            var _opts = this.opts;
            var _this = this;
            if (_opts.autoRun) {
                _this.timer = setInterval(function () {
                    _this.righRun();
                }, _opts.autoRunTime);
            }
        },
        //左按钮点击事件
        leftRun: function () {
            var _opts = this.opts;
            var index = this.getIndex();
            var pageCount = this.getPageCount();
            index--;
            if (index < 0) {
                if (_opts.loopRun) {
                    index = pageCount - 1;
                } else {
                    return;
                }
            }
            this.setIndex(index);
        },
        //右按钮点击事件
        righRun: function () {
            var _opts = this.opts;
            var index = this.getIndex();
            var pageCount = this.getPageCount();
            index++;
            if (index >= pageCount) {
                if (_opts.loopRun) {
                    index = 0;
                } else {
                    return;
                }
            }

            this.setIndex(index);
        }
    }

    //注册成 jquery插件,返回控件对象
    $.fn.sliderBar = function (options) {
        var bar = new SliderBar(this, options);
        bar.init();
        return bar;
    }
})(jQuery);