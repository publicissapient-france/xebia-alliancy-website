(function () {

    var PAGES = [
        {page: 'xebia', title: "Xebia", url: 'index.html', mainUrl:'http://www.xebia.fr'},
        {page: 'ux', title: "UX Republic", url: 'ux.html', mainUrl:'http://ux-republic.com'},
        {page: 'labs', title: "Xebia Labs", url: 'labs.html', mainUrl: 'http://www.xebialabs.com'},
        {page: 'thiga', title: "THIGA", url: 'thiga.html', mainUrl:'http://www.thiga.com'}
    ];

    window.APPLICATION = {
        currentPage: null,
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
        initBlocks: function() {
            $('#blockContent').isotope({
                itemSelector : '.block',
                layoutMode : 'fitRows'
            });
        },
        initNavigation: function () {
            var self = this;

            //bug qui fait que l'animation ne se déclenche pas
            var $headers = $('.headers');
            $headers.css('left', $headers.css('left'));

            var goToNextPage = function () {
                var currentIndex = _.findIndex(PAGES, function (page) {
                    return page.page == self.currentPage
                });

                var nextPageIndex = (currentIndex >= PAGES.length - 1) ? 0 : currentIndex + 1;
                var nextPage = PAGES[nextPageIndex];

                self.navigate(nextPage);
            };

            $('.next-page').click(goToNextPage);

            $('.prev-page').click(function () {
                var currentIndex = _.findIndex(PAGES, function (page) {
                    return page.page == self.currentPage
                });

                var nextPageIndex = (currentIndex < 1) ? PAGES.length - 1 : currentIndex - 1;
                var nextPage = PAGES[nextPageIndex];

                self.navigate(nextPage);
            });

            $('.page-indicators > span').click(function() {
                var nextPageIndex = $('.page-indicators > span').index(this);
                var nextPage = PAGES[nextPageIndex];

                self.navigate(nextPage);
            });

            setInterval(function () {
             //   goToNextPage();
            }, 10000);
        },
        goToPage: function (pageToGo) {
            var self = this;
            var indexOfPage = _.findIndex(PAGES, function (page) {
                return page.page == pageToGo.page;
            });

            $('.wrapper').attr('class', 'wrapper ' + pageToGo.page);
            $('.knowing-more a').attr('href', pageToGo.mainUrl).attr('title', pageToGo.title);

            $('.headers').animate({
                left: (-indexOfPage * 1024) + 'px'
            }, 500, function () {
                self.currentPage = pageToGo.page;
            });
        },
        navigate: function (page) {
            this.goToPage(page);
            history.pushState(page, page.title, page.url)
        }
    };
})();

