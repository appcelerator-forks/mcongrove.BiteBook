#include "log_length.h"
#include <pebble.h>
#include "config.c"

static Window *s_window;
static GFont s_res_bitham_30_black;
static GBitmap *s_res_icon_arrow_up_white;
static GBitmap *s_res_icon_arrow_down_white;
static TextLayer *s_text_feet;
static TextLayer *s_text_inch;
static TextLayer *s_text_label_feet;
static TextLayer *s_text_label_inch;
static BitmapLayer *s_bitmap_arrow_down_inch;
static BitmapLayer *s_bitmap_arrow_up_inch;
static BitmapLayer *s_bitmap_arrow_down_feet;
static BitmapLayer *s_bitmap_arrow_up_feet;

/** UI **/

static void initialise_ui(void) {
	s_window = window_create();
	window_set_background_color(s_window, GColorBlack);
	window_set_fullscreen(s_window, true);
	
	s_res_bitham_30_black = fonts_get_system_font(FONT_KEY_BITHAM_30_BLACK);
	s_res_icon_arrow_up_white = gbitmap_create_with_resource(RESOURCE_ID_ICON_ARROW_UP_WHITE);
	s_res_icon_arrow_down_white = gbitmap_create_with_resource(RESOURCE_ID_ICON_ARROW_DOWN_WHITE);
	
	s_text_feet = text_layer_create(GRect(0, 52, 72, 30));
	text_layer_set_background_color(s_text_feet, GColorClear);
	text_layer_set_text_color(s_text_feet, GColorWhite);
	text_layer_set_text(s_text_feet, "");
	text_layer_set_text_alignment(s_text_feet, GTextAlignmentCenter);
	text_layer_set_font(s_text_feet, s_res_bitham_30_black);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_text_feet);
	
	s_text_inch = text_layer_create(GRect(72, 52, 72, 30));
	text_layer_set_background_color(s_text_inch, GColorClear);
	text_layer_set_text_color(s_text_inch, GColorWhite);
	text_layer_set_text(s_text_inch, "");
	text_layer_set_text_alignment(s_text_inch, GTextAlignmentCenter);
	text_layer_set_font(s_text_inch, s_res_bitham_30_black);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_text_inch);
	
	s_text_label_feet = text_layer_create(GRect(0, 140, 72, 14));
	text_layer_set_background_color(s_text_label_feet, GColorClear);
	text_layer_set_text_color(s_text_label_feet, GColorWhite);
	text_layer_set_text(s_text_label_feet, "ft");
	text_layer_set_text_alignment(s_text_label_feet, GTextAlignmentCenter);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_text_label_feet);
	
	s_text_label_inch = text_layer_create(GRect(72, 140, 72, 20));
	text_layer_set_background_color(s_text_label_inch, GColorClear);
	text_layer_set_text_color(s_text_label_inch, GColorWhite);
	text_layer_set_text(s_text_label_inch, "in");
	text_layer_set_text_alignment(s_text_label_inch, GTextAlignmentCenter);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_text_label_inch);
	
	s_bitmap_arrow_down_inch = bitmap_layer_create(GRect(99, 99, 17, 15));
	bitmap_layer_set_bitmap(s_bitmap_arrow_down_inch, s_res_icon_arrow_down_white);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_bitmap_arrow_down_inch);
	
	s_bitmap_arrow_up_inch = bitmap_layer_create(GRect(99, 27, 17, 15));
	bitmap_layer_set_bitmap(s_bitmap_arrow_up_inch, s_res_icon_arrow_up_white);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_bitmap_arrow_up_inch);
	
	s_bitmap_arrow_down_feet = bitmap_layer_create(GRect(28, 99, 17, 15));
	bitmap_layer_set_bitmap(s_bitmap_arrow_down_feet, s_res_icon_arrow_down_white);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_bitmap_arrow_down_feet);
	
	s_bitmap_arrow_up_feet = bitmap_layer_create(GRect(28, 27, 17, 15));
	bitmap_layer_set_bitmap(s_bitmap_arrow_up_feet, s_res_icon_arrow_up_white);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_bitmap_arrow_up_feet);
}

static void destroy_ui(void) {
	window_destroy(s_window);
	text_layer_destroy(s_text_feet);
	text_layer_destroy(s_text_inch);
	text_layer_destroy(s_text_label_feet);
	text_layer_destroy(s_text_label_inch);
	bitmap_layer_destroy(s_bitmap_arrow_down_inch);
	bitmap_layer_destroy(s_bitmap_arrow_up_inch);
	bitmap_layer_destroy(s_bitmap_arrow_down_feet);
	bitmap_layer_destroy(s_bitmap_arrow_up_feet);
	gbitmap_destroy(s_res_icon_arrow_up_white);
	gbitmap_destroy(s_res_icon_arrow_down_white);
}

static void handle_window_unload(Window* window) {
	destroy_ui();
}

/** Window Management **/

void show_log_length(void) {
	initialise_ui();
	
	window_set_window_handlers(s_window, (WindowHandlers) {
		.unload = handle_window_unload,
	});
	
	window_stack_push(s_window, true);
}

void hide_log_length(void) {
	window_stack_remove(s_window, true);
}