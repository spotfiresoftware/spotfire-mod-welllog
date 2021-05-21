/*--------------------------------------------------

	VanillaDrawer Ver.1.0 2017-05-16

--------------------------------------------------*/

export var vanilla_drawer;

export function initialize() {
    vanilla_drawer = new VanillaDrawer();
    return vanilla_drawer;
}


function VanillaDrawer() {
    this.drawer_menu_w = 300;
    this.drawer_menu_span = 20;
    this.drawer_content_scroll_x = 0;
    this.drawer_content_scroll_y = 0;
    this.drawer_menu_x = 0;
    this.drawer_content_rect = "";
    this.drawer_content_x = 0;
    this.drawer_content_y = 0;
    this.drawer_content_w = 0;
    this.drawer_content_h = 0;
    this.touch_start_x = 0;
    this.touch_start_y = 0;
    this.touch_move_x = 0;
    this.touch_move_y = 0;
    this.touch_diff = 0;
    this.scroll_start = 0;
    this.scroll_end = 0;
    this.scroll_diff = 0;
    this.drawer_content = document.getElementById("drawer_content");
    this.drawer_wall = document.getElementById("drawer_wall");
    this.drawer_menu = document.getElementById("drawer_menu");
    this.drawer_menu.style.width = this.drawer_menu_w + "px";
    this.drawer_menu.style.left = "-" + this.drawer_menu_w + "px";
    // --------------------------------------------------
    this.drawer_menu_open = function () {
        this.drawer_menu_x = parseInt(this.drawer_menu.style.left);
        if (this.drawer_menu_x >= 0) {
            return false;
        }
        this.drawer_menu.scrollTop = 0;
        this.drawer_content_scroll_x = window.pageXOffset;
        this.drawer_content_scroll_y = window.pageYOffset;
        this.drawer_content_rect = this.drawer_content.getBoundingClientRect();
        this.drawer_content_x = Math.round(this.drawer_content_rect.left);
        this.drawer_content_y = Math.round(this.drawer_content_rect.top);
        this.drawer_content_w = Math.round(this.drawer_content_rect.width);
        this.drawer_content_h = Math.round(this.drawer_content_rect.height);
        this.drawer_menu_open_effect(
            this.drawer_content_w,
            this.drawer_content_x,
            this.drawer_content_y,
            this.drawer_menu_x
        );
    };
    // --------------------------------------------------
    this.drawer_menu_open_effect = function (drawer_content_w, drawer_content_x, drawer_content_y, drawer_menu_x) {
        this.drawer_wall.style.display = "block";
        drawer_menu_x = drawer_menu_x + this.drawer_menu_span;
        this.drawer_menu.style.left = drawer_menu_x + "px";
        if (drawer_menu_x >= 0) {
            this.drawer_content.style.position = "fixed";
            this.drawer_content.style.zIndex = "1";
            this.drawer_content.style.width = drawer_content_w + "px";
            this.drawer_content.style.left = drawer_content_x + "px";
            this.drawer_content.style.top = drawer_content_y + "px";
        } else {
            setTimeout(function () {
                vanilla_drawer.drawer_menu_open_effect(
                    drawer_content_w,
                    drawer_content_x,
                    drawer_content_y,
                    drawer_menu_x
                );
            }, 10);
        }
    };
    // --------------------------------------------------
    this.drawer_menu_close = function () {
        this.drawer_menu_x = parseInt(this.drawer_menu.style.left);
        vanilla_drawer.drawer_menu_close_effect(
            this.drawer_content_w,
            this.drawer_content_x,
            this.drawer_content_y,
            this.drawer_menu_x
        );
    };
    // --------------------------------------------------
    this.drawer_menu_close_effect = function (drawer_content_w, drawer_content_x, drawer_content_y, drawer_menu_x) {
        drawer_menu_x = drawer_menu_x - this.drawer_menu_span;
        this.drawer_menu.style.left = drawer_menu_x + "px";
        if (drawer_menu_x <= -1 * this.drawer_menu_w) {
            this.drawer_wall.style.display = "none";
            this.drawer_content.style.position = "static";
            window.scrollTo(0, this.drawer_content_scroll_y);
        } else {
            setTimeout(function () {
                vanilla_drawer.drawer_menu_close_effect(
                    drawer_content_w,
                    drawer_content_x,
                    drawer_content_y,
                    drawer_menu_x
                );
            }, 10);
        }
    };
    // --------------------------------------------------
    this.touch_start = function (event) {
        this.touch_start_x = 0;
        this.touch_start_y = 0;
        this.touch_move_x = 0;
        this.touch_move_y = 0;
        this.touch_diff = 0;
        this.scroll_start = 0;
        this.scroll_end = 0;
        this.scroll_diff = 0;
        this.scroll_start = window.pageYOffset;
        this.touch_start_x = event.touches[0].pageX;
        this.touch_start_y = event.touches[0].pageY;
    };
    // --------------------------------------------------
    this.touch_move = function (event) {
        this.touch_move_x = event.changedTouches[0].pageX;
        this.touch_move_y = event.changedTouches[0].pageY;
    };
    // --------------------------------------------------
    this.touch_end = function (event) {
        this.scroll_end = window.pageYOffset;
        if (this.scroll_end < this.scroll_start) {
            this.scroll_diff = this.scroll_start - this.scroll_end;
        } else if (this.scroll_end > this.scroll_start) {
            this.scroll_diff = this.scroll_end - this.scroll_start;
        }
        if (this.touch_start_y < this.touch_move_y) {
            this.touch_diff = this.touch_move_y - this.touch_start_y;
        } else if (this.touch_start_y > this.touch_move_y) {
            this.touch_diff = this.touch_start_y - this.touch_move_y;
        }
        if (this.touch_start_x > this.touch_move_x) {
            if (this.touch_start_x > this.touch_move_x + 50 && this.touch_diff < 50 && this.scroll_diff < 50) {
                vanilla_drawer.drawer_menu_close();
            }
        } else if (this.touch_start_x < this.touch_move_x) {
            if (this.touch_start_x + 50 < this.touch_move_x && this.touch_diff < 50 && this.scroll_diff < 50) {
                vanilla_drawer.drawer_menu_open();
            }
        }
    };

    window.addEventListener(
        "load",
        function (event) {
            window.addEventListener(
                "touchstart",
                function (event) {
                    vanilla_drawer.touch_start(event);
                },
                false
            );
            window.addEventListener(
                "touchmove",
                function (event) {
                    vanilla_drawer.touch_move(event);
                },
                false
            );
            window.addEventListener(
                "touchend",
                function (event) {
                    vanilla_drawer.touch_end(event);
                },
                false
            );
        },
        false
    );
}
