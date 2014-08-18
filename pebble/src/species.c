#include "species.h"
#include <pebble.h>
#include "config.c"

static Window *s_window;
static MenuLayer *s_menu_species;

/** UI **/

static void initialise_ui(void) {
	s_window = window_create();
	window_set_background_color(s_window, GColorBlack);
	window_set_fullscreen(s_window, true);
	
	s_menu_species = menu_layer_create(GRect(0, 0, 144, 168));
	menu_layer_set_click_config_onto_window(s_menu_species, s_window);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_menu_species);
}

static void destroy_ui(void) {
	window_destroy(s_window);
	menu_layer_destroy(s_menu_species);
}

static void handle_window_unload(Window* window) {
	destroy_ui();
}

/** Window Management **/

void show_species(void) {
	initialise_ui();
	
	window_set_window_handlers(s_window, (WindowHandlers) {
		.unload = handle_window_unload,
	});
	
	window_stack_push(s_window, true);
}

void hide_species(void) {
	window_stack_remove(s_window, true);
}