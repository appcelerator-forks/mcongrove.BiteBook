#include <pebble.h>

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
char locCountText[2];

static int TRIP_COUNT = 0;
static int LOC_COUNT = 0;

enum {
	KEY_TRIP = 0x0,
	KEY_LOC = 0x1
};

/********/
/** UI **/
/********/

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

static void set_trip_count() {
	if (persist_exists(KEY_TRIP)) {
		TRIP_COUNT = persist_read_int(KEY_TRIP);
	}
	
	snprintf(tripCountText, 100, "%d", TRIP_COUNT);
	
	text_layer_set_text(s_text_count_trip, tripCountText);
}

static void set_loc_count() {
	if (persist_exists(KEY_LOC)) {
		LOC_COUNT = persist_read_int(KEY_LOC);
	}
	
	snprintf(locCountText, 100, "%d", LOC_COUNT);
	
	text_layer_set_text(s_text_count_location, locCountText);
}

/********************/
/** Event Handlers **/
/********************/

static void handle_minute_tick(struct tm *tick_time, TimeUnits units_changed) {
	time_t now = time(NULL);
	struct tm *t = localtime(&now);
	
	char *time_format;
	
	if(clock_is_24h_style()) {
		time_format = "%k:%M";
	} else {
		time_format = "%l:%M";
	}
	
	strftime(timeText, sizeof(timeText), time_format, t);
	
	text_layer_set_text(s_text_time, timeText);
}

void select_single_click_handler(ClickRecognizerRef recognizer, void *context) {
	APP_LOG(APP_LOG_LEVEL_INFO, "CLICK!");
	
	Tuplet value = TupletInteger(1, 1);
	
	DictionaryIterator *iter;
	app_message_outbox_begin(&iter);
	
	if (iter == NULL) {
		return;
	}
	
	dict_write_tuplet(iter, &value);
	dict_write_end(iter);
	
	app_message_outbox_send();
}

/***************/
/** App Comms **/
/***************/

static void in_received_handler(DictionaryIterator *iter, void *context) {
	Tuple *trip_tuple = dict_find(iter, KEY_TRIP);
	Tuple *loc_tuple = dict_find(iter, KEY_LOC);
	
	trip_tuple ? persist_write_int(KEY_TRIP, trip_tuple->value->uint8) : false;
	loc_tuple ? persist_write_int(KEY_LOC, loc_tuple->value->uint8) : false;

	set_trip_count();
	set_loc_count();
}

static void in_dropped_handler(AppMessageResult reason, void *context) {
	
}

void out_sent_handler(DictionaryIterator *sent, void *context) {
	APP_LOG(APP_LOG_LEVEL_INFO, "Sent message!");
}

void out_failed_handler(DictionaryIterator *send, AppMessageResult reason, void *context) {
	char* message;
	switch(reason) {
		case APP_MSG_OK:
			message = "APP_MSG_OK";
			break;
		case APP_MSG_SEND_TIMEOUT:
			message = "APP_MSG_SEND_TIMEOUT";
			break;
		case APP_MSG_SEND_REJECTED:
			message = "APP_MSG_SEND_REJECTED";
			break;
		case APP_MSG_NOT_CONNECTED:
			message = "APP_MSG_NOT_CONNECTED";
			break;
		case APP_MSG_APP_NOT_RUNNING:
			message = "APP_MSG_APP_NOT_RUNNING";
			break;
		case APP_MSG_INVALID_ARGS:
			message = "APP_MSG_INVALID_ARGS";
			break;
		case APP_MSG_BUFFER_OVERFLOW:
			message = "APP_MSG_BUFFER_OVERFLOW";
			break;
		case APP_MSG_ALREADY_RELEASED:
			message = "APP_MSG_ALREADY_RELEASED";
			break;
		case APP_MSG_CALLBACK_ALREADY_REGISTERED:
			message = "APP_MSG_CALLBACK_ALREADY_REGISTERED";
			break;
		case APP_MSG_CALLBACK_NOT_REGISTERED:
			message = "APP_MSG_CALLBACK_NOT_REGSITERED";
			break;
		case APP_MSG_OUT_OF_MEMORY:
			message = "APP_MSG_OUT_OF_MEMORY";
			break;
		case APP_MSG_CLOSED:
			message = "APP_MSG_CLOSED";
			break;
		case APP_MSG_INTERNAL_ERROR:
			message = "APP_MSG_INTERNAL_ERROR";
			break;
		default:
			message = "OTHER";
	}
	APP_LOG(APP_LOG_LEVEL_ERROR, "Outbox failed!");
	APP_LOG(APP_LOG_LEVEL_ERROR, message);
}

/************/
/** Pebble **/
/************/

void config_provider(void *context) {
	window_single_click_subscribe(BUTTON_ID_SELECT, select_single_click_handler);
}

static void init() {
	app_message_register_inbox_received(in_received_handler);
	app_message_register_inbox_dropped(in_dropped_handler);
	//app_message_register_outbox_sent(out_sent_handler);
	//app_message_register_outbox_failed(out_failed_handler);
	
	const uint32_t inbound_size = 40;
	const uint32_t outbound_size = 40;
	app_message_open(inbound_size, outbound_size);
	
	initialise_ui();
	
	window_set_window_handlers(s_window, (WindowHandlers) {
		.unload = handle_window_unload,
	});
	
	window_set_click_config_provider(s_window, config_provider);
	
	window_stack_push(s_window, true);
	
	tick_timer_service_subscribe(MINUTE_UNIT, handle_minute_tick);
	
	set_trip_count();
	set_loc_count();
}

static void deinit() {
	window_stack_remove(s_window, true);
	
	tick_timer_service_unsubscribe();
}

int main(void) {
	init();
	app_event_loop();
	deinit();
}