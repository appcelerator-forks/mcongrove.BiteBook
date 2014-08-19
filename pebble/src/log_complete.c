#include "log_complete.h"
#include <pebble.h>
#include "config.c"
#include "log_length.h"

static Window *s_window;
static GFont s_res_gothic_14;
static GFont s_res_gothic_18_bold;
static GFont s_res_gothic_28_bold;
static TextLayer *s_text_notice;
static TextLayer *s_text_species;
static TextLayer *s_text_weight;
static TextLayer *s_text_length;
static InverterLayer *s_inverter_layer;
static AppTimer *s_timer;

static char weightText[15];
static char poundText[4];
static char ounceText[4];
static char lengthText[15];
static char feetText[4];
static char inchText[4];

static char LOG_SPECIES_ID[2];
static char LOG_SPECIES[10];
static int LOG_POUND = 0;
static int LOG_OUNCE = 0;
static int LOG_FEET = 0;
static int LOG_INCH = 0;

/** UI **/

static void initialise_ui(void) {
	s_window = window_create();
	window_set_background_color(s_window, GColorBlack);
	window_set_fullscreen(s_window, true);
	
	s_res_gothic_14 = fonts_get_system_font(FONT_KEY_GOTHIC_14);
	s_res_gothic_18_bold = fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD);
	s_res_gothic_28_bold = fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD);
	
	s_text_notice = text_layer_create(GRect(0, 20, 144, 20));
	text_layer_set_background_color(s_text_notice, GColorClear);
	text_layer_set_text_color(s_text_notice, GColorWhite);
	text_layer_set_text(s_text_notice, "Catch Logged");
	text_layer_set_text_alignment(s_text_notice, GTextAlignmentCenter);
	text_layer_set_font(s_text_notice, s_res_gothic_14);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_text_notice);
	
	s_text_species = text_layer_create(GRect(0, 55, 144, 30));
	text_layer_set_background_color(s_text_species, GColorClear);
	text_layer_set_text_color(s_text_species, GColorWhite);
	text_layer_set_text(s_text_species, "");
	text_layer_set_text_alignment(s_text_species, GTextAlignmentCenter);
	text_layer_set_font(s_text_species, s_res_gothic_28_bold);
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
	
	s_inverter_layer = inverter_layer_create(GRect(0, 0, 144, 168));
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_inverter_layer);
}

static void destroy_ui(void) {
	window_destroy(s_window);
	text_layer_destroy(s_text_notice);
	text_layer_destroy(s_text_species);
	text_layer_destroy(s_text_weight);
	text_layer_destroy(s_text_length);
	inverter_layer_destroy(s_inverter_layer);
}

static void handle_window_unload(Window* window) {
	destroy_ui();
}

static void set_species() {
	if (persist_exists(KEY_LOG_SPECIES)) {
		persist_read_string(KEY_LOG_SPECIES, LOG_SPECIES_ID, 2);
	}
	
	if (persist_exists(KEY_LOG_SPECIES_NAME)) {
		persist_read_string(KEY_LOG_SPECIES_NAME, LOG_SPECIES, 10);
	}
	
	text_layer_set_text(s_text_species, LOG_SPECIES);
}

static void set_weight() {
	if (persist_exists(KEY_LOG_WEIGHT_POUND)) {
		LOG_POUND = persist_read_int(KEY_LOG_WEIGHT_POUND);
	}
	
	if (persist_exists(KEY_LOG_WEIGHT_OUNCE)) {
		LOG_OUNCE = persist_read_int(KEY_LOG_WEIGHT_OUNCE);
	}
	
	snprintf(poundText, 4, "%d", LOG_POUND);
	snprintf(ounceText, 4, "%d", LOG_OUNCE);
	
	strcpy(weightText, poundText);
	strcat(weightText, " lb ");
	strcat(weightText, ounceText);
	strcat(weightText, " oz");
	
	text_layer_set_text(s_text_weight, weightText);
}

static void set_length() {
	if (persist_exists(KEY_LOG_LENGTH_FEET)) {
		LOG_FEET = persist_read_int(KEY_LOG_LENGTH_FEET);
	}
	
	if (persist_exists(KEY_LOG_LENGTH_INCH)) {
		LOG_INCH = persist_read_int(KEY_LOG_LENGTH_INCH);
	}
	
	snprintf(feetText, 4, "%d", LOG_FEET);
	snprintf(inchText, 4, "%d", LOG_INCH);
	
	strcpy(lengthText, feetText);
	strcat(lengthText, " ft ");
	strcat(lengthText, inchText);
	strcat(lengthText, " in");
	
	text_layer_set_text(s_text_length, lengthText);
}

/** Event Handlers **/

static void timer_callback(void *data) {
	app_timer_cancel(s_timer);
	
	hide_log_complete();
}

/** Window Management **/

void show_log_complete(void) {
	initialise_ui();
	
	window_set_window_handlers(s_window, (WindowHandlers) {
		.unload = handle_window_unload,
	});
	
	window_stack_push(s_window, true);
	
	hide_log_length();
	
	set_species();
	set_weight();
	set_length();
	
	s_timer = app_timer_register(3000, timer_callback, NULL);
}

void hide_log_complete(void) {
	window_stack_remove(s_window, true);
}