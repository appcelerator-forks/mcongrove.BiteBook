#include "log_complete.h"
#include <pebble.h>
#include "config.c"

static Window *s_window;
static GFont s_res_gothic_14;
static GFont s_res_gothic_18_bold;
static TextLayer *s_text_notice;
static TextLayer *s_text_species;
static TextLayer *s_text_weight;
static TextLayer *s_text_length;

/** UI **/

static void initialise_ui(void) {
	s_window = window_create();
	window_set_background_color(s_window, GColorBlack);
	window_set_fullscreen(s_window, true);
	
	s_res_gothic_14 = fonts_get_system_font(FONT_KEY_GOTHIC_14);
	s_res_gothic_18_bold = fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD);
	
	s_text_notice = text_layer_create(GRect(0, 20, 144, 20));
	text_layer_set_background_color(s_text_notice, GColorClear);
	text_layer_set_text_color(s_text_notice, GColorWhite);
	text_layer_set_text(s_text_notice, "Catch Logged");
	text_layer_set_text_alignment(s_text_notice, GTextAlignmentCenter);
	text_layer_set_font(s_text_notice, s_res_gothic_14);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_text_notice);
	
	s_text_species = text_layer_create(GRect(0, 75, 144, 20));
	text_layer_set_background_color(s_text_species, GColorClear);
	text_layer_set_text_color(s_text_species, GColorWhite);
	text_layer_set_text(s_text_species, "");
	text_layer_set_text_alignment(s_text_species, GTextAlignmentCenter);
	text_layer_set_font(s_text_species, s_res_gothic_18_bold);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_text_species);
	
	s_text_weight = text_layer_create(GRect(0, 100, 144, 20));
	text_layer_set_background_color(s_text_weight, GColorClear);
	text_layer_set_text_color(s_text_weight, GColorWhite);
	text_layer_set_text(s_text_weight, "0 lbs 0 oz");
	text_layer_set_text_alignment(s_text_weight, GTextAlignmentCenter);
	text_layer_set_font(s_text_weight, s_res_gothic_18_bold);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_text_weight);
	
	s_text_length = text_layer_create(GRect(0, 125, 144, 20));
	text_layer_set_background_color(s_text_length, GColorClear);
	text_layer_set_text_color(s_text_length, GColorWhite);
	text_layer_set_text(s_text_length, "0 ft 0 in");
	text_layer_set_text_alignment(s_text_length, GTextAlignmentCenter);
	text_layer_set_font(s_text_length, s_res_gothic_18_bold);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_text_length);
}

static void destroy_ui(void) {
	window_destroy(s_window);
	text_layer_destroy(s_text_notice);
	text_layer_destroy(s_text_species);
	text_layer_destroy(s_text_weight);
	text_layer_destroy(s_text_length);
}

static void handle_window_unload(Window* window) {
	destroy_ui();
}

/** Window Management **/

void show_log_complete(void) {
	initialise_ui();
	
	window_set_window_handlers(s_window, (WindowHandlers) {
		.unload = handle_window_unload,
	});
	
	window_stack_push(s_window, true);
}

void hide_log_complete(void) {
	window_stack_remove(s_window, true);
}