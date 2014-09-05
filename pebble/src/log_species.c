#include "log_species.h"
#include <pebble.h>
#include "config.c"
#include "log_weight.h"

typedef struct {
	char *id;
	char *name;
} Species;

Species species[] = {
	{
		.id = "1",
		.name = "Bass"
	},
	{
		.id = "2",
		.name = "Bluegill"
	},
	{
		.id = "5",
		.name = "Carp"
	},
	{
		.id = "6",
		.name = "Catfish"
	},
	{
		.id = "7",
		.name = "Crappie"
	},
	{
		.id = "8",
		.name = "Drum"
	},
	{
		.id = "9",
		.name = "Gar"
	},
	{
		.id = "11",
		.name = "Perch"
	},
	{
		.id = "12",
		.name = "Pickeral"
	},
	{
		.id = "13",
		.name = "Pike"
	},
	{
		.id = "14",
		.name = "Shad"
	},
	{
		.id = "15",
		.name = "Sunfish"
	},
	{
		.id = "16",
		.name = "Trout"
	}
};

#define NUM_SPECIES sizeof(species) / sizeof(Species)

static Window *s_window;
static SimpleMenuLayer *s_menu_species;
static SimpleMenuSection menu_sections[0];
static SimpleMenuItem menu_items[NUM_SPECIES];

/** UI **/

static void menu_select_callback(int index, void *ctx) {
	Species *specy = &species[index];
	
	persist_write_string(KEY_LOG_SPECIES, specy->id);
	persist_write_string(KEY_LOG_SPECIES_NAME, specy->name);
	
	show_log_weight();
}

static void initialise_ui(void) {
	s_window = window_create();
	window_set_fullscreen(s_window, true);
	
	for(int i = 0; (unsigned)i < NUM_SPECIES; i++) {
		Species *specy = &species[i];
		
		menu_items[i] = (SimpleMenuItem){
			.title = specy->name,
			.callback = menu_select_callback
		};
	}
	
	menu_sections[0] = (SimpleMenuSection){
		.num_items = NUM_SPECIES,
		.items = menu_items
	};

	s_menu_species = simple_menu_layer_create(GRect(0, 0, 144, 168), s_window, menu_sections, 1, NULL);
	layer_add_child(window_get_root_layer(s_window), (Layer *)s_menu_species);
}

static void destroy_ui(void) {
	window_destroy(s_window);
	simple_menu_layer_destroy(s_menu_species);
}

static void handle_window_unload(Window* window) {
	destroy_ui();
}

/** Window Management **/

void show_log_species(void) {
	initialise_ui();
	
	window_set_window_handlers(s_window, (WindowHandlers) {
		.unload = handle_window_unload
	});
	
	window_stack_push(s_window, true);
}

void hide_log_species(void) {
	window_stack_remove(s_window, true);
}