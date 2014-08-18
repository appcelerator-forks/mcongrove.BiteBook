#include "main.h"
#include <pebble.h>
#include "config.c"

static Window *s_window;
static GFont s_res_gothic_18_bold;
static GBitmap *s_res_icon_location_white;
static GBitmap *s_res_icon_fish_white;
static GFont s_res_roboto_bold_subset_49;
static TextLayer *s_text_count_location;
static BitmapLayer *s_bitmap_icon_location;
static TextLayer *s_text_count_trip;
static BitmapLayer *s_bitmap_icon_fish;
static TextLayer *s_text_time;

char timeText[] = "00:00";
char tripCountText[2];
char locationCountText[2];

static int TRIP_COUNT = 0;
static int LOCATION_COUNT = 0;

/** UI **/

static void initialise_ui(void) {
	s_window = window_create();
	window_set_background_color(s_window, GColorBlack);
	window_set_fullscreen(s_window, true);
	
	s_res_gothic_18_bold = fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD);
	s_res_icon_location_white = gbitmap_create_with_resource(RESOURCE_ID_ICON_LOCATION_WHITE);
	s_res_icon_fish_white = gbitmap_create_with_resource(RESOURCE_ID_ICON_FISH_WHITE);
	s_res_roboto_bold_subset_49 = fonts_get_system_font(FONT_KEY_ROBOTO_BOLD_SUBSET_49);
	
	s_text_count_location = text_layer_create(GRect(120, 131, 21, 21));
	text_layer_set_background_color(s_text_count_location, GColorClear);
	text_layer_set_text_color(s_text_count_location, GColorWhite);
	text_layer_set_text(s_text_count_location, "0");
	text_layer_set_font(s_text_count_location, s_res_gothic_18_bold);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_text_count_location);
	
	s_bitmap_icon_location = bitmap_layer_create(GRect(89, 130, 21, 21));
	bitmap_layer_set_bitmap(s_bitmap_icon_location, s_res_icon_location_white);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_bitmap_icon_location);
	
	s_text_count_trip = text_layer_create(GRect(53, 131, 21, 21));
	text_layer_set_background_color(s_text_count_trip, GColorClear);
	text_layer_set_text_color(s_text_count_trip, GColorWhite);
	text_layer_set_text(s_text_count_trip, "0");
	text_layer_set_font(s_text_count_trip, s_res_gothic_18_bold);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_text_count_trip);
	
	s_bitmap_icon_fish = bitmap_layer_create(GRect(15, 130, 28, 21));
	bitmap_layer_set_bitmap(s_bitmap_icon_fish, s_res_icon_fish_white);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_bitmap_icon_fish);
	
	s_text_time = text_layer_create(GRect(0, 48, 144, 50));
	text_layer_set_background_color(s_text_time, GColorClear);
	text_layer_set_text_color(s_text_time, GColorWhite);
	text_layer_set_text(s_text_time, "");
	text_layer_set_text_alignment(s_text_time, GTextAlignmentCenter);
	text_layer_set_font(s_text_time, s_res_roboto_bold_subset_49);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_text_time);
}

static void destroy_ui(void) {
	window_destroy(s_window);
	text_layer_destroy(s_text_count_location);
	bitmap_layer_destroy(s_bitmap_icon_location);
	text_layer_destroy(s_text_count_trip);
	bitmap_layer_destroy(s_bitmap_icon_fish);
	text_layer_destroy(s_text_time);
	gbitmap_destroy(s_res_icon_location_white);
	gbitmap_destroy(s_res_icon_fish_white);
}

static void handle_window_unload(Window* window) {
	destroy_ui();
}

/** Public Methods **/

void set_trip_count() {
	if (persist_exists(KEY_TRIP)) {
		TRIP_COUNT = persist_read_int(KEY_TRIP);
	}
	
	snprintf(tripCountText, 100, "%d", TRIP_COUNT);
	
	text_layer_set_text(s_text_count_trip, tripCountText);
}

void set_location_count() {
	if (persist_exists(KEY_LOCATION)) {
		LOCATION_COUNT = persist_read_int(KEY_LOCATION);
	}
	
	snprintf(locationCountText, 100, "%d", LOCATION_COUNT);
	
	text_layer_set_text(s_text_count_location, locationCountText);
}

/** Event Handlers **/

static void handle_minute_tick(struct tm *tick_time, TimeUnits units_changed) {
	time_t now = time(NULL);
	struct tm *t = localtime(&now);
	
	char *time_format;
	
	if(clock_is_24h_style()) {
		time_format = "%H:%M";
	} else {
		time_format = "%I:%M";
	}
	
	strftime(timeText, sizeof(timeText), time_format, t);
	
	text_layer_set_text(s_text_time, timeText);
}

void select_single_click_handler(ClickRecognizerRef recognizer, void *context) {
	APP_LOG(APP_LOG_LEVEL_INFO, "Click Received:Select");
	
	Tuplet value = TupletInteger(1, 1);
	
	DictionaryIterator *iter;
	app_message_outbox_begin(&iter);
	
	if(iter == NULL) {
		return;
	}
	
	dict_write_tuplet(iter, &value);
	dict_write_end(iter);
	
	app_message_outbox_send();
}

/** Window Management **/

void config_provider(void *context) {
	window_single_click_subscribe(BUTTON_ID_SELECT, select_single_click_handler);
}

void show_main(void) {
	initialise_ui();
	
	window_set_window_handlers(s_window, (WindowHandlers) {
		.unload = handle_window_unload,
	});
	
	window_set_click_config_provider(s_window, config_provider);
	
	window_stack_push(s_window, true);
	
	tick_timer_service_subscribe(MINUTE_UNIT, handle_minute_tick);
	
	set_trip_count();
	set_location_count();
}

void hide_main(void) {
	window_stack_remove(s_window, true);
	
	tick_timer_service_unsubscribe();
}