/**
 * Update sidebar.
 * @param {String} view     Selector of the sidebar pane
 * @param {Object} button   Event source
 * @return {null}
 */
var updateSidebarNav = function (view, button) {
    var target = $(button).data('target');
    $(view).show();
    $(view).siblings().hide();
    $('.content').show();
    $('.menu').hide();
    $('#btn-sidebar-menu').closest('li').removeClass('active');

    if ($(view).find('button[data-target=#left-sidebar-sub]').length == 0) {
        $('#left-sidebar-sub').hide();
    } else {
        $('#left-sidebar-sub').show();
    }
}
