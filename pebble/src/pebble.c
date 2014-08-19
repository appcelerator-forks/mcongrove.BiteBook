#include <pebble.h>
#include "config.c"
#include "main.h"

/** App Comms **/

static void in_received_handler(DictionaryIterator *iter, void *context) {
	Tuple *trip_tuple = dict_find(iter, KEY_TRIP);
	Tuple *location_tuple = dict_find(iter, KEY_LOCATION);
	
	trip_tuple ? persist_write_int(KEY_TRIP, trip_tuple->value->uint8) : false;
	location_tuple ? persist_write_int(KEY_LOCATION, location_tuple->value->uint8) : false;

	set_trip_count();
	set_location_count();
}

static void in_dropped_handler(AppMessageResult reason, void *context) {
	
}

void out_sent_handler(DictionaryIterator *sent, void *context) {
	APP_LOG(APP_LOG_LEVEL_INFO, "Message Send:Success");
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
	
	APP_LOG(APP_LOG_LEVEL_ERROR, "Message Send:Failure");
	APP_LOG(APP_LOG_LEVEL_ERROR, message);
}

/** Pebble **/

static void init() {
	app_message_register_inbox_received(in_received_handler);
	app_message_register_inbox_dropped(in_dropped_handler);
	app_message_register_outbox_sent(out_sent_handler);
	app_message_register_outbox_failed(out_failed_handler);
	
	const uint32_t inbound_size = 64;
	const uint32_t outbound_size = 64;
	app_message_open(inbound_size, outbound_size);
	
	show_main();
}

static void deinit() {
	hide_main();
}

int main(void) {
	init();
	app_event_loop();
	deinit();
}