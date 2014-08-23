#include "syncing.h"
#include <pebble.h>
#include "config.c"
#include "log_length.h"
#include "log_success.h"
#include "log_failure.h"

static Window *s_window;
static GBitmap *s_res_icon_syncing_white;
static GFont s_res_gothic_14;
static BitmapLayer *s_bitmap_icon_sync;
static InverterLayer *s_inverter_layer;

static char poundText[4];
static char ounceText[4];
static char feetText[4];
static char inchText[4];

static char LOG_SPECIES_ID[4];
static int LOG_POUND = 0;
static int LOG_OUNCE = 0;
static int LOG_FEET = 0;
static int LOG_INCH = 0;

/** UI **/

static void initialise_ui(void) {
	s_window = window_create();
	window_set_background_color(s_window, GColorBlack);
	window_set_fullscreen(s_window, true);
	
	s_res_icon_syncing_white = gbitmap_create_with_resource(RESOURCE_ID_SYNCING_WHITE);
	s_res_gothic_14 = fonts_get_system_font(FONT_KEY_GOTHIC_14);

	s_bitmap_icon_sync = bitmap_layer_create(GRect(41, 48, 62, 70));
	bitmap_layer_set_bitmap(s_bitmap_icon_sync, s_res_icon_syncing_white);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_bitmap_icon_sync);
	
	s_inverter_layer = inverter_layer_create(GRect(0, 0, 144, 168));
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_inverter_layer);
}

static void destroy_ui(void) {
	window_destroy(s_window);
	bitmap_layer_destroy(s_bitmap_icon_sync);
	gbitmap_destroy(s_res_icon_syncing_white);
}

static void handle_window_unload(Window* window) {
	destroy_ui();
}

/** Data **/

static void get_log_data() {
	if (persist_exists(KEY_LOG_SPECIES)) {
		persist_read_string(KEY_LOG_SPECIES, LOG_SPECIES_ID, 4);
	}
	
	if (persist_exists(KEY_LOG_WEIGHT_POUND)) {
		LOG_POUND = persist_read_int(KEY_LOG_WEIGHT_POUND);
	}
	
	if (persist_exists(KEY_LOG_WEIGHT_OUNCE)) {
		LOG_OUNCE = persist_read_int(KEY_LOG_WEIGHT_OUNCE);
	}
	
	if (persist_exists(KEY_LOG_LENGTH_FEET)) {
		LOG_FEET = persist_read_int(KEY_LOG_LENGTH_FEET);
	}
	
	if (persist_exists(KEY_LOG_LENGTH_INCH)) {
		LOG_INCH = persist_read_int(KEY_LOG_LENGTH_INCH);
	}
	
	snprintf(poundText, 4, "%d", LOG_POUND);
	snprintf(ounceText, 4, "%d", LOG_OUNCE);
	snprintf(feetText, 4, "%d", LOG_FEET);
	snprintf(inchText, 4, "%d", LOG_INCH);
}

/** App Comms **/

static void send_to_phone() {	
	DictionaryIterator *iter;
	app_message_outbox_begin(&iter);
	
	if(iter == NULL) {
		return;
	}
	
	static char JSON[64];
	
	strcpy(JSON, "{\"S\":");
	strcat(JSON, LOG_SPECIES_ID);
	strcat(JSON, ",\"WP\":");
	strcat(JSON, poundText);
	strcat(JSON, ",\"WO\":");
	strcat(JSON, ounceText);
	strcat(JSON, ",\"LF\":");
	strcat(JSON, feetText);
	strcat(JSON, ",\"LI\":");
	strcat(JSON, inchText);
	strcat(JSON, "}");
	
	dict_write_cstring(iter, 0, JSON);
	dict_write_end(iter);
	
	app_message_outbox_send();
}

static void out_sent_handler(DictionaryIterator *sent, void *context) {
	APP_LOG(APP_LOG_LEVEL_INFO, "Message Send:Success");
	
	show_log_success();
}

static void out_failed_handler(DictionaryIterator *send, AppMessageResult reason, void *context) {
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
	
	APP_LOG(APP_LOG_LEVEL_ERROR, "Message Send:Failure");
	APP_LOG(APP_LOG_LEVEL_ERROR, message);
	
	show_log_failure();
}

/** Window Management */

void show_syncing(void) {
	initialise_ui();
	
	window_set_window_handlers(s_window, (WindowHandlers) {
		.unload = handle_window_unload
	});
	
	window_stack_push(s_window, false);
	
	hide_log_length();
	
	app_message_register_outbox_sent(out_sent_handler);
	app_message_register_outbox_failed(out_failed_handler);
	
	get_log_data();
	send_to_phone();
}

void hide_syncing(void) {
	window_stack_remove(s_window, false);
}