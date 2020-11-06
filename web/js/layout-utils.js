function resizeTabPage(tabs, pageIndex) {
    var ul = $(tabs.children()[0]);
    var lis = ul.children();
    var li = $(lis[pageIndex]);
    var a = $(li.find("a"))[0];
    if (!a) return;
    var hash = a.hash;
    var content = $(tabs.find(hash));
    var page = $(content.children()[0]);
    page.width(tabs.width() - 30);
    page.height(tabs.height() - 56);
    doChildLayout(page);
}

function initializeTabsLayout(tabs, activateCallback) {
    var activeIndex = tabs.tabs("option", "active");
    var ul = $(tabs.children()[0]);
    var lis = ul.children();
    $.each(lis, function (i, li) {
        var a = $($(li).find("a"))[0];
        if (!a) $.error("No <a> element in tab:" + li);
        var hash = a.hash;
        var content = $(tabs.find(hash));
        if (!content) $.error("No panel found in tabs with id '" + hash + "'");
        var page = $(content.children()[0]);
        if (!page) $.error("No page inside tab container '" + hash + "'");
        page.css("position", "absolute");
        if (playsLayout(page) && !isLayoutInitialized(page)) {
            initChildLayout(page);
        }
    });
    tabs.data("on-layout-resize", function () {
        resizeTabPage(tabs, tabs.tabs("option", "active"));
    });
    tabs.tabs("option", "activate", function (event, ui) {
        resizeTabPage(tabs, tabs.tabs("option", "active"));
        if (activateCallback) activateCallback(event, ui);
    });
}

function attachElementsToTabs(tabs, divs, grids, nomargin) {
	if (divs) {
		for (var i=0; i<divs.length; i++) {
			var d = divs[i];
			d.css("position", "absolute");
			initChildLayout(d);
		}
	}
	tabs.data("on-layout-resize", function() {
		var w = tabs.width();
		var h = tabs.height();
		if (grids) {
			for (var i=0; i<grids.length; i++) {
				grids[i].jqGrid("setGridWidth", w - 30);
				grids[i].jqGrid("setGridHeight", h - 96);
			}
		}
		if (divs) {
			for (var i=0; i<divs.length; i++) {
				var d = divs[i];
				if (nomargin) {
					d.width(w - 2);
					d.height(h - 32);					
				} else {
					d.width(w - 30);
					d.height(h - 56); // 56
				}
				doChildLayout(d);
			}
		}
	});
}

function attachJQGridToContainerPanel(container, grid, noCaption) {
	container.data("on-layout-resize", function() {
		grid.jqGrid("setGridWidth", container.width());
		if (noCaption) {
			grid.jqGrid("setGridHeight", (container.height() - 24));
		} else {
			grid.jqGrid("setGridHeight", (container.height() - 46));
		}
		return false;
	});
}

function ajustaJQGrid(grid) {
	grid.jqGrid("setGridWidth", grid.parent().width());
}
