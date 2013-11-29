(function () {

    var PAGES = [
        {page: 'xebia', title: "Xebia", url: 'index.html', mainUrl: 'http://www.xebia.fr'},
        {page: 'ux', title: "UX Republic", url: 'ux.html', mainUrl: 'http://ux-republic.com'},
        {page: 'labs', title: "Xebia Labs", url: 'labs.html', mainUrl: 'http://www.xebialabs.com'},
        {page: 'thiga', title: "THIGA", url: 'thiga.html', mainUrl: 'http://www.thiga.com'}
    ];

    var findPageIndex = function (currentPage) {
        return _.findIndex(PAGES, function (page) {
            return page.page == currentPage;
        });
    };

    var formatDateIso = function (date) {
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDay();

        return '' + year + '-' + month + '-' + day;
    };


    var MONTH_SHORT = {
        '1': 'Jan',
        '2': 'Feb',
        '3': 'Mar',
        '4': 'Apr',
        '5': 'May',
        '6': 'Jun',
        '7': 'Jul',
        '8': 'Aug',
        '9': 'Sep',
        '10': 'Oct',
        '11': 'Nov',
        '12': 'Dec'
    };
    var formatDateTitle = function (date) {
        var year = date.getFullYear();
        var monthNum = date.getMonth() + 1;
        var month = MONTH_SHORT['' + monthNum];
        var day = date.getDay();

        return '' + day + ' ' + month + ' ' + year;
    };

    var createStandardBlock = function (entity, date, title, img, altImg) {
        var template = '<section class="block standard-block eventbrite-block" style="opacity:1;display:inline-block;">';
        template += '<div class="title-block xebia-title">' + entity;

        template += '<time datetime="' + formatDateIso(date) + '">' + formatDateTitle(date) + '</time>';
        template += '</div>';
        template += '<div class="content-block">';
        template += '<h1>' + title + '</h1>';

        template += '<div class="bottom-arrow"></div>';
        template += '<img src="' + img + '" alt="' + altImg + '" class="illustration big-illustration"/>';
        template += '</div>';
        template += '</section>';

        return template;

    };

    window.APPLICATION = {
        currentPage: null,
        navigationIntervalIndex: null,
        init: function (currentPage) {
            this.currentPage = currentPage;
            this.initRouting();
            this.initNavigation();
            this.initBlocks();
            this.initStickyHeader();

        },
        initStickyHeader: function () {
            var $window = $(window);
            var $header = $('header');
            var headerBottomPosition = $header.position().top + $header.height();
            var $frise = $('.frise');
            var stickyThreshold = headerBottomPosition - $frise.height();
            $window.scroll(function () {
                if ($window.scrollTop() > stickyThreshold) {
                    $frise.css({
                        position: 'fixed',
                        top: 0,
                        bottom: 'inherit'
                    });
                } else {
                    $frise.attr('style', '');
                }
            });
        },
        initRouting: function () {
            var self = this;
            window.onpopstate = function (event) {
                var page = event.state;
                if (page) {
                    self.goToPage(page);
                }
            }
        },
        initBlocks: function () {

            this.initEventbriteBlock();

            var $blockContent = $('#blockContent');
            $blockContent.mixitup({
                targetSelector: '.block'
            });
            $blockContent.sortable();
        },
        initEventbriteBlock: function () {
            Eventbrite({'app_key': 'UW2IBMBZKW4U6EPHQK'}, function (ebClient) {
                ebClient.organizer_list_events({'id': 1627902102 }, function (response) {
                    if (response.events && response.events.length > 0) {
                        var now = new Date().getTime();
                        var nextEvent = _.find(response.events, function (eventWrapper) {
                            var event = eventWrapper.event;
                            var startDate = new Date(event.start_date);

                            return startDate.getTime() > now;
                        });
                        if (nextEvent) {

                            var event = nextEvent.event;

                            var eventBriteBlock = createStandardBlock('Xebia', new Date(event.start_date), event.title, event.logo, 'logo ' + event.title);
                            $('#blockContent').append(eventBriteBlock);
                        }
                    }
                });
            });

        },
        initNavigation: function () {
            var self = this;

            //bug qui fait que l'animation ne se déclenche pas
            var $headers = $('.headers');

            var leftPercentPosition = ($headers.css('left').replace('px', '') << 0) * 100 / $headers.width();
            $headers.css('left', leftPercentPosition + '%');
            $headers.find('> div').css('display', 'block');

            $('.next-page').click(this.goToNextPage.bind(this));
            $('.prev-page').click(this.goToPrevPage.bind(this));

            $('.page-indicators > span').click(function () {
                var nextPageIndex = $('.page-indicators > span').index(this);
                var nextPage = PAGES[nextPageIndex];

                self.navigate(nextPage);
            });

            this.initNavigationInterval();
        },
        goToNextPage: function () {
            var currentIndex = findPageIndex(this.currentPage);

            var nextPageIndex = (currentIndex >= PAGES.length - 1) ? 0 : currentIndex + 1;
            var nextPage = PAGES[nextPageIndex];

            this.navigate(nextPage);
        },
        goToPrevPage: function () {
            var currentIndex = findPageIndex(this.currentPage);

            var prevPageIndex = (currentIndex < 1) ? PAGES.length - 1 : currentIndex - 1;
            var prevPage = PAGES[prevPageIndex];

            this.navigate(prevPage);
        },
        initNavigationInterval: function () {
            clearInterval(this.navigationIntervalIndex);
            var self = this;
            this.navigationIntervalIndex = setInterval(function () {
                self.goToNextPage();
            }, 10000);
        },
        goToPage: function (pageToGo) {
            var self = this;
            var indexOfPage = findPageIndex(pageToGo.page);

            $('.wrapper').attr('class', 'wrapper ' + pageToGo.page);
            $('.knowing-more a').attr('href', pageToGo.mainUrl).attr('title', pageToGo.title);

            $('.headers').animate({
                left: (-indexOfPage * 100) + '%'
            }, 500, function () {
                self.currentPage = pageToGo.page;
            });
            this.initNavigationInterval();
        },
        navigate: function (page) {
            this.goToPage(page);
            history.pushState(page, page.title, page.url)
        }
    };
})();

