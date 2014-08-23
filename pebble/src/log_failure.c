#include "log_failure.h"
#include <pebble.h>
#include "syncing.h"

static Window *s_window;
static GFont s_res_gothic_14;
static TextLayer *s_text_notice;
static TextLayer *s_text_note;
static InverterLayer *s_inverter_layer;
static AppTimer *s_timer;

/** UI **/

static void initialise_ui(void) {
	s_window = window_create();
	window_set_background_color(s_window, GColorBlack);
	window_set_fullscreen(s_window, true);
	
	s_res_gothic_14 = fonts_get_system_font(FONT_KEY_GOTHIC_14);
	
	s_text_notice = text_layer_create(GRect(0, 20, 144, 20));
	text_layer_set_background_color(s_text_notice, GColorClear);
	text_layer_set_text_color(s_text_notice, GColorWhite);
	text_layer_set_text(s_text_notice, "Send Failure");
	text_layer_set_text_alignment(s_text_notice, GTextAlignmentCenter);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_text_notice);
	
	s_text_note = text_layer_create(GRect(20, 60, 104, 60));
	text_layer_set_background_color(s_text_note, GColorClear);
	text_layer_set_text_color(s_text_note, GColorWhite);
	text_layer_set_text(s_text_note, "Please ensure your watch is connected and BiteBook is open on your phone");
	text_layer_set_text_alignment(s_text_note, GTextAlignmentCenter);
	text_layer_set_font(s_text_note, s_res_gothic_14);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_text_note);
	
	s_inverter_layer = inverter_layer_create(GRect(0, 0, 144, 168));
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_inverter_layer);
}

static void destroy_ui(void) {
	window_destroy(s_window);
	text_layer_destroy(s_text_notice);
	text_layer_destroy(s_text_note);
}

static void handle_window_unload(Window* window) {
	destroy_ui();
}

/** Event Handlers **/

static void timer_callback(void *data) {
	hide_log_failure();
}

/** Window Management **/

void show_log_failure(void) {
	initialise_ui();
	
	window_set_window_handlers(s_window, (WindowHandlers) {
		.unload = handle_window_unload
	});
	
	window_stack_push(s_window, false);
	
	hide_syncing();
	
	s_timer = app_timer_register(5000, timer_callback, NULL);
	
	static const uint32_t const vibe_segments[] = { 100, 100, 100, 100, 100, 100 };
	VibePattern vibe_pattern = { .durations = vibe_segments, .num_segments = ARRAY_LENGTH(vibe_segments) };
	vibes_enqueue_custom_pattern(vibe_pattern);
}

void hide_log_failure(void) {
	window_stack_remove(s_window, true);
}