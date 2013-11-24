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

    window.APPLICATION = {
        currentPage: null,
        navigationIntervalIndex: null,
        init: function (currentPage) {
            this.currentPage = currentPage;
            this.initRouting();
            this.initNavigation();
            this.initBlocks();

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
            $('#blockContent').isotope({
                itemSelector: '.block',
                layoutMode: 'fitRows'
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

