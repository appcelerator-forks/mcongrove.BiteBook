#include "log_weight.h"
#include <pebble.h>
#include "config.c"
#include "log_species.h"
#include "log_length.h"

static Window *s_window;
static GFont s_res_bitham_30_black;
static GBitmap *s_res_icon_arrow_up_white;
static GBitmap *s_res_icon_arrow_down_white;
static TextLayer *s_text_pound;
static TextLayer *s_text_ounce;
static TextLayer *s_text_label_pound;
static TextLayer *s_text_label_ounce;
static BitmapLayer *s_bitmap_arrow_down_ounce;
static BitmapLayer *s_bitmap_arrow_up_ounce;
static BitmapLayer *s_bitmap_arrow_down_pound;
static BitmapLayer *s_bitmap_arrow_up_pound;
static InverterLayer *s_inverter_layer;

static char poundText[4];
static char ounceText[4];

static int EDIT_POSITION = 0;
static int LOG_POUND = 0;
static int LOG_OUNCE = 0;

/** UI **/

static void initialise_ui(void) {
	EDIT_POSITION = 0;
	LOG_POUND = 0;
	LOG_OUNCE = 0;

	s_window = window_create();
	window_set_background_color(s_window, GColorBlack);
	window_set_fullscreen(s_window, true);
	
	s_res_bitham_30_black = fonts_get_system_font(FONT_KEY_BITHAM_30_BLACK);
	s_res_icon_arrow_up_white = gbitmap_create_with_resource(RESOURCE_ID_ICON_ARROW_UP_WHITE);
	s_res_icon_arrow_down_white = gbitmap_create_with_resource(RESOURCE_ID_ICON_ARROW_DOWN_WHITE);
	
	s_text_pound = text_layer_create(GRect(0, 52, 72, 30));
	text_layer_set_background_color(s_text_pound, GColorClear);
	text_layer_set_text_color(s_text_pound, GColorWhite);
	text_layer_set_text(s_text_pound, "0");
	text_layer_set_text_alignment(s_text_pound, GTextAlignmentCenter);
	text_layer_set_font(s_text_pound, s_res_bitham_30_black);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_text_pound);
	
	s_text_ounce = text_layer_create(GRect(72, 52, 72, 30));
	text_layer_set_background_color(s_text_ounce, GColorClear);
	text_layer_set_text_color(s_text_ounce, GColorWhite);
	text_layer_set_text(s_text_ounce, "0");
	text_layer_set_text_alignment(s_text_ounce, GTextAlignmentCenter);
	text_layer_set_font(s_text_ounce, s_res_bitham_30_black);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_text_ounce);
	
	s_text_label_pound = text_layer_create(GRect(0, 140, 72, 14));
	text_layer_set_background_color(s_text_label_pound, GColorClear);
	text_layer_set_text_color(s_text_label_pound, GColorWhite);
	text_layer_set_text(s_text_label_pound, "lbs");
	text_layer_set_text_alignment(s_text_label_pound, GTextAlignmentCenter);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_text_label_pound);
	
	s_text_label_ounce = text_layer_create(GRect(72, 140, 72, 20));
	text_layer_set_background_color(s_text_label_ounce, GColorClear);
	text_layer_set_text_color(s_text_label_ounce, GColorWhite);
	text_layer_set_text(s_text_label_ounce, "oz");
	text_layer_set_text_alignment(s_text_label_ounce, GTextAlignmentCenter);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_text_label_ounce);
	
	s_bitmap_arrow_down_ounce = bitmap_layer_create(GRect(99, 99, 17, 15));
	bitmap_layer_set_bitmap(s_bitmap_arrow_down_ounce, s_res_icon_arrow_down_white);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_bitmap_arrow_down_ounce);
	
	s_bitmap_arrow_up_ounce = bitmap_layer_create(GRect(99, 27, 17, 15));
	bitmap_layer_set_bitmap(s_bitmap_arrow_up_ounce, s_res_icon_arrow_up_white);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_bitmap_arrow_up_ounce);
	
	s_bitmap_arrow_down_pound = bitmap_layer_create(GRect(28, 99, 17, 15));
	bitmap_layer_set_bitmap(s_bitmap_arrow_down_pound, s_res_icon_arrow_down_white);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_bitmap_arrow_down_pound);
	
	s_bitmap_arrow_up_pound = bitmap_layer_create(GRect(28, 27, 17, 15));
	bitmap_layer_set_bitmap(s_bitmap_arrow_up_pound, s_res_icon_arrow_up_white);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_bitmap_arrow_up_pound);
	
	s_inverter_layer = inverter_layer_create(GRect(0, 0, 144, 168));
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_inverter_layer);
}

static void destroy_ui(void) {
	window_destroy(s_window);
	text_layer_destroy(s_text_pound);
	text_layer_destroy(s_text_ounce);
	text_layer_destroy(s_text_label_pound);
	text_layer_destroy(s_text_label_ounce);
	inverter_layer_destroy(s_inverter_layer);
	bitmap_layer_destroy(s_bitmap_arrow_down_ounce);
	bitmap_layer_destroy(s_bitmap_arrow_up_ounce);
	bitmap_layer_destroy(s_bitmap_arrow_down_pound);
	bitmap_layer_destroy(s_bitmap_arrow_up_pound);
	gbitmap_destroy(s_res_icon_arrow_up_white);
	gbitmap_destroy(s_res_icon_arrow_down_white);
}

static void handle_window_unload(Window* window) {
	destroy_ui();
}

/** Event Handlers **/

static void up_repeating_click_handler(ClickRecognizerRef recognizer, void *context) {
	if(EDIT_POSITION == 0) {
		if(LOG_POUND < 20) {
			LOG_POUND++;
			
			snprintf(poundText, 4, "%d", LOG_POUND);
			text_layer_set_text(s_text_pound, poundText);
		}
	} else {
		if(LOG_OUNCE < 15) {
			LOG_OUNCE++;
		} else {
			LOG_OUNCE = 0;
		}
		
		snprintf(ounceText, 4, "%d", LOG_OUNCE);
		text_layer_set_text(s_text_ounce, ounceText);
	}
}

static void down_repeating_click_handler(ClickRecognizerRef recognizer, void *context) {
	if(EDIT_POSITION == 0) {
		if(LOG_POUND > 0) {
			LOG_POUND--;
			
			snprintf(poundText, 4, "%d", LOG_POUND);
			text_layer_set_text(s_text_pound, poundText);
		}
	} else {
		if(LOG_OUNCE > 0) {
			LOG_OUNCE--;
		} else {
			LOG_OUNCE = 15;
		}
		
		snprintf(ounceText, 4, "%d", LOG_OUNCE);
		text_layer_set_text(s_text_ounce, ounceText);
	}
}

static void select_single_click_handler(ClickRecognizerRef recognizer, void *context) {
	if(EDIT_POSITION == 0) {
		EDIT_POSITION = 1;
	} else {
		persist_write_int(KEY_LOG_WEIGHT_POUND, LOG_POUND);
		persist_write_int(KEY_LOG_WEIGHT_OUNCE, LOG_OUNCE);
		
		show_log_length();
	}
}

static void back_single_click_handler(ClickRecognizerRef recognizer, void *context) {
	if(EDIT_POSITION == 1) {
		EDIT_POSITION = 0;
	} else {
		hide_log_weight();
	}
}

/** Window Management **/

static void config_provider(void *context) {
	window_single_repeating_click_subscribe(BUTTON_ID_UP, 250, up_repeating_click_handler);
	window_single_repeating_click_subscribe(BUTTON_ID_DOWN, 250, down_repeating_click_handler);
	window_single_click_subscribe(BUTTON_ID_SELECT, select_single_click_handler);
	window_single_click_subscribe(BUTTON_ID_BACK, back_single_click_handler);
}

void show_log_weight(void) {
	initialise_ui();
	
	window_set_window_handlers(s_window, (WindowHandlers) {
		.unload = handle_window_unload
	});
	
	window_set_click_config_provider(s_window, config_provider);
	
	window_stack_push(s_window, true);
	
	hide_log_species();
}

void hide_log_weight(void) {
	window_stack_remove(s_window, true);
}