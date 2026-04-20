
const RANDOM_SORT_KEY = "random";

class display {

  constructor(data, card_manager) {
    this.database = data;
    this.pokemon_manager = card_manager;
    
    this.current_batch = [];
    this.next_batch = [];

    this.display_count = 3;
    this.active_sort_key = RANDOM_SORT_KEY;
    this.ascending = true;

    this.pokemon_data = new pokemon_data(this.database, this.display_count);
  }

  // initialize app
  init() {
    this.setup_controls();
    this.refresh_batches();
    this.update_random_button_text();
    console.log("----- Pokedex initialized -----");
  }

  // setup all controls
  setup_controls() {
    // random button
    const random_button = document.getElementById("random-batch");
    // sort dropdown
    const sort_dropdown = document.getElementById("sort-dropdown");
    // sort order button
    const switch_button = document.getElementById("sort-order-btn");
    // previous and next button
    const before_button = document.getElementById("before-batch");
    const next_button = document.getElementById("next-batch");
    // display count input
    const display_count_input = document.getElementById("display-count-input");
    
    this.random_button = random_button;
    this.sort_dropdown = sort_dropdown;
    this.switch_button = switch_button;
    this.before_button_el = before_button;
    this.next_button_el = next_button;
    this.display_count_input = display_count_input;

    // click to switch back to random mode
    if (random_button) {
      random_button.addEventListener("click", () => {
        console.log("Random button clicked");
        
        // if not in the random mod, change to random mod
        if (this.active_sort_key !== RANDOM_SORT_KEY) {
          this.switch_to_random_mode();
          return;
        }
        
        //otherwise, load next batch
        this.load_next_batch();
      });
    }

    // change sort key
    if (sort_dropdown) {
      this.populate_sort_dropdown();
      sort_dropdown.addEventListener("change", (event) => {
        this.sort_by_stat(event.target.value);
      });
    }

    // toggle ascending / descending
    if (switch_button) {
      switch_button.textContent = this.ascending ? "Ascending" : "Descending";
      switch_button.addEventListener("click", () => {

        let selected_key;
        if (this.sort_dropdown) {
          selected_key = this.sort_dropdown.value;
        } else {
          selected_key = this.active_sort_key;
        }

        if (!selected_key || selected_key === RANDOM_SORT_KEY) {
          console.log("No sort key selected, order toggle ignored");
          return;
        }

        this.active_sort_key = selected_key;
        this.ascending = !this.ascending;
        switch_button.textContent = this.ascending ? "Ascending" : "Descending";
        this.sort_by_stat(selected_key);
      });
    }

    // go to previous batch
    if (before_button) {
      before_button.addEventListener("click", () => {
        console.log("Before button clicked");
        this.before_button();
      });
    }

    // go to next batch
    if (next_button) {
      next_button.addEventListener("click", () => {
        console.log("Next button clicked");
        this.load_next_batch();
      });
    }

    // change display count
    if (display_count_input) {
      const update_display_count = (event) => {
        this.set_display_count(event.target.value);
      };
      display_count_input.addEventListener("change", update_display_count);
      display_count_input.addEventListener("input", update_display_count);
    }

  }

  // update cards per page
  set_display_count(raw_value) {
    const new_count = Number.parseInt(raw_value, 10);
    // validate input
    if (Number.isNaN(new_count) || new_count < 1 || new_count > 6) {
      console.log("Invalid display count, must be between 1 and 6");
      if (this.display_count_input) {
        this.display_count_input.value = String(this.display_count);
      }
      return false;
    }

    // keep same position *2 becuase to preloading the next branch
    let current_index = this.pokemon_data.current_index - (2 * this.display_count);

    if (current_index < 0) {
      current_index = 0;
    }

    this.display_count = new_count;
    this.pokemon_data.display_count = new_count;
    this.pokemon_data.current_index = current_index;

    if (this.display_count_input) {
      this.display_count_input.value = String(new_count);
    }

    this.refresh_batches();
    console.log(`Display count updated: ${new_count}`);

    return true;
  }

  // switch to random mode
  switch_to_random_mode() {

    this.active_sort_key = RANDOM_SORT_KEY;
    this.ascending = true;

    if (this.sort_dropdown) {
      this.sort_dropdown.value = RANDOM_SORT_KEY;
    }
    if (this.switch_button) {
      this.switch_button.textContent = "Ascending";
    }

    this.pokemon_data.switch_to_random_mode();

    this.refresh_batches();
    this.update_random_button_text();
    console.log("Switched to random mode");
  }

  // sort cards by selected stat
  sort_by_stat(stat_name) {

    if (!stat_name || stat_name === RANDOM_SORT_KEY) {
      this.switch_to_random_mode();
      console.log("Sort cleared, switched back to random mode");
      return;
    }

    this.active_sort_key = stat_name;

    this.pokemon_data.apply_sort_by_stat(stat_name, this.ascending);
    this.refresh_batches();
    this.update_random_button_text();

    console.log(`Applied sort by ${stat_name} in ${this.ascending ? "ascending" : "descending"} order`);
  }

  // update random button label
  update_random_button_text() {
    if (!this.random_button) {
      return;
    }

    this.random_button.textContent = this.active_sort_key === RANDOM_SORT_KEY ? "Random Card!" : "Not Random";
  }

  // fill dropdown options
  populate_sort_dropdown() {
    const { sort_dropdown } = this;
    sort_dropdown.innerHTML = "";

    const place_holder = document.createElement("option");
    place_holder.value = RANDOM_SORT_KEY;
    place_holder.textContent = "Random";
    sort_dropdown.appendChild(place_holder);

    utils.pokemon_stats.forEach((stat) => {
      const option = document.createElement("option");
      option.value = stat;
      option.textContent = utils.stat_labels[stat];
      sort_dropdown.appendChild(option);
    });

    const total_option = document.createElement("option");
    total_option.value = "total";
    total_option.textContent = utils.stat_labels.total;
    sort_dropdown.appendChild(total_option);
  }

  // load previous batch
  before_button (){
    if (this.pokemon_data.current_index < this.display_count * 3) {
      console.log("Already at the beginning of the list");
      return;
    }
    this.pokemon_data.current_index -= this.display_count * 3;
    this.refresh_batches();
    console.log(" ----- Loaded previous batch of pokemon -----");
  }

  // load next batch
  load_next_batch() {
    const { pokemon_data, pokemon_manager } = this;

    this.current_batch = this.next_batch;
    pokemon_manager.display_cards(this.current_batch);

    this.next_batch = pokemon_data.draw_pokemon();
    utils.preload_images(this.next_batch);
    console.log("----- Loaded next batch of pokemon -----");
  }

  // draw current and preload next
  refresh_batches() {
    const { pokemon_data, pokemon_manager } = this;

    this.current_batch = pokemon_data.draw_pokemon();
    this.next_batch = pokemon_data.draw_pokemon();

    pokemon_manager.display_cards(this.current_batch);
    utils.preload_images(this.next_batch);
  }
}

class pokenmon_card {

  constructor(container_id, template_id) {
    this.container = document.getElementById(container_id);
    this.template = document.getElementById(template_id);
  }

  display_cards(batch) {
    const { template, container } = this;
    if (!template || !container) return;

    container.innerHTML = "";
    const temp_box = document.createDocumentFragment();

    batch.forEach((pokemon) => {
      const card_clone = this.create_single_card(pokemon, template);
      temp_box.appendChild(card_clone);
    });
    container.appendChild(temp_box);
    console.log("Cards displayed");
  }

  // Create a single card element
  create_single_card(pokemon, template) {
    const card_clone = template.content.cloneNode(true);
    
    // Set image source
    const img_element = card_clone.querySelector(".card-img");
    img_element.src = utils.get_sprite_url(pokemon.id);
    img_element.alt = pokemon.name;

    // Format types，some pokemon have two types, some only have one
    let types_string;
      if (pokemon.type2) {
        types_string = `${pokemon.type1}, ${pokemon.type2}`;
      } else {
        types_string = pokemon.type1;
      }
    
    // Format abilities, height and weight, stats
    const abilities = utils.formatted_abilities(pokemon.abilities);
    const height_weight = `Height: ${pokemon.height / 10}m | Weight: ${pokemon.weight / 10}kg`;
    const stats = utils.format_stats(pokemon);

    // Set text content for the card
    utils.set_text(card_clone, ".card-title", pokemon.name.toUpperCase());
    utils.set_text(card_clone, ".card-type", `TYPE: ${types_string.toUpperCase()}`);
    utils.set_text(card_clone, ".card-id", `ID: ${pokemon.id}`);
    utils.set_text(card_clone, ".card-h_weight", height_weight);
    utils.set_inner_html(card_clone, ".card-stats", stats);
    utils.set_text(card_clone, ".card-ability", `ABILITIES: ${abilities}`);
    
    return card_clone;
  }

}

class pokemon_data{
  constructor(data, display_count){
    this.database = data;
    this.display_count = display_count;
    
    this.current_index = 0;
    this.random_pokemon = utils.shuffled_array(this.database);
    this.ordered_pokemon = this.random_pokemon;
    
    this.active_sort_key = RANDOM_SORT_KEY;
    this.sorted_cache = {};
    this.sorted_cache_order = {};
  } 

  // Reset random mode state in one place.
  switch_to_random_mode() {
    this.active_sort_key = RANDOM_SORT_KEY;
    this.random_pokemon = utils.shuffled_array(this.database);
    this.ordered_pokemon = this.random_pokemon;
    this.current_index = 0;
  }

  // Shuffle random pokemon from the database
  draw_pokemon() {
    
    //drawn all cards reshuffle and start over
    if (this.current_index + this.display_count > this.ordered_pokemon.length) {
      if (this.active_sort_key !== RANDOM_SORT_KEY) {
        console.log("Reached end of sorted list, restarting from top...");
      } else {
        console.log("All pokemon drawn, reshuffling...");
        this.random_pokemon = utils.shuffled_array(this.database);
        this.ordered_pokemon = this.random_pokemon;
      }
      this.current_index = 0;
    }

    // Select the next batch of pokemon
    const selected = this.ordered_pokemon.slice(
      this.current_index, 
      this.current_index + 
      this.display_count);

    this.current_index += this.display_count;

    console.log("Drew pokemon:", selected);
    return selected;
  }

  apply_sort_by_stat(stat_name, ascending = false) {
    if (!stat_name || stat_name === RANDOM_SORT_KEY) {
      this.switch_to_random_mode();
      return;
    }

    this.active_sort_key = stat_name;

    if (!this.sorted_cache[stat_name]) {
      this.sorted_cache[stat_name] = utils.sort_array(this.database, stat_name);
      this.sorted_cache_order[stat_name] = "asc";
    }

    let target_order;
    if (ascending) {
      target_order = "asc";
    } else {
      target_order = "desc";
    }
    if (this.sorted_cache_order[stat_name] !== target_order) {
      // Reverse in place for asc or desc
      this.sorted_cache[stat_name].reverse();
      this.sorted_cache_order[stat_name] = target_order;
    }

    this.active_sort_key = stat_name;
    this.ordered_pokemon = this.sorted_cache[stat_name];
    this.current_index = 0;
  }

}

const utils = {
  
  pokemon_stats: ["hp", "attack", "defense", "sp_attack", "sp_defense", "speed"],
  pokemon_max_stats: [255, 181, 230, 173, 230, 200, 720],

  stat_labels: {
    hp: "HP",
    attack: "ATK",
    defense: "DEF",
    sp_attack: "Sp. ATK",
    sp_defense: "Sp. DEF",
    speed: "SPD",
    total: "TOTAL"
  },

  // Format base stats and total score
  format_stats(pokemon) {

    const formatted_array = utils.pokemon_stats.map((stat, index) => {
      const label = utils.stat_labels[stat];
      const value = pokemon[stat];
      const max_value = utils.pokemon_max_stats[index];
      return `${label}: ${value}/${max_value}` ;
    });

    const stats_string = formatted_array.join("<br>");
    const total_score = this.total_score(pokemon);

    const max_total = utils.pokemon_max_stats[6];
    return `${stats_string}<br><strong>Tot: ${total_score}/${max_total}</strong>`;
  },

  // Format abilities
  formatted_abilities(abilities_string) {
    if (!abilities_string) {
      return "None";
    }

    return abilities_string
      .split(",")
      .map((ability) => {
        const trimmed = ability.trim();
        return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
      })
      .join(", ");
  },

  // Calculate total score
  total_score(pokemon) {
    return utils.pokemon_stats.reduce((sum, key) => {
      const value = Number.isFinite(pokemon[key]) ? (pokemon[key]) : 0;;
      return sum + value;
    }, 0);
  },

  // Shuffle an array
  shuffled_array(array) {
    return [...array].sort(() => Math.random() - 0.5);
  },

  // Build artwork URL from pokemon id
  get_sprite_url(pokemon_id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon_id}.png`;
  },

  // Preload image for refreshing page faster
  preload_images(batch) {
    batch.forEach((pokemon) => {
      const img = new Image();
      img.src = utils.get_sprite_url(pokemon.id);
    });
  },

  sort_array(arr, key) {
    const sorted = [...arr];

    if (key === "total") {
      sorted.sort(function(a, b) {
        const diff = utils.total_score(a) - utils.total_score(b);
        if (diff !== 0) {
          return diff;
        } else {
          return a.id - b.id;
        }
      });
    } else {
      sorted.sort(function(a, b) {
        const a_value = Number.isFinite(a[key]) ? a[key] : 0;
        const b_value = Number.isFinite(b[key]) ? b[key] : 0;
        const diff = a_value - b_value;
        if (diff !== 0) {
          return diff;
        } else {
          return a.id - b.id;
        }
      });
    }

    return sorted;
  },


  // Helper function to set text content
  set_text(card_clone, selector, value) {
    const element = card_clone.querySelector(selector);
    if (element) {
      element.textContent = value;
    }
  },

  //Helper function toe set innerHTML content
  set_inner_html(card_clone, selector, value) {
    const element = card_clone.querySelector(selector);
    if (element) {
      element.innerHTML = value;
    }
  },

  /*
  // 2way sort function
  sort_array(arr, key) {
    if (arr.length <= 1) {
      return arr;
    }

    // find mid element index
    const mid = Math.floor(arr.length / 2);

    // left and right halves
    const left = utils.sort_array(arr.slice(0, mid), key);
    const right = utils.sort_array(arr.slice(mid), key);

    return utils.merge_arrays(left, right, key);
  },


  merge_arrays(left, right, key) {
    const merged = [];
    let i = 0, j = 0;

    while (i < left.length && j < right.length) {
      // insert the smallest element into the merged array
      const left_value = utils.get_sort_value(left[i], key);
      const right_value = utils.get_sort_value(right[j], key);

      if (left_value < right_value) {
        merged.push(left[i]);
        i++;
      } else {
        merged.push(right[j]);
        j++;
      }
    }

    return merged.concat(left.slice(i)).concat(right.slice(j));
  } */

  
};

document.addEventListener("DOMContentLoaded", async () => {

  const response = await fetch("./data/pokemon_stats_1_9.json");
  const pokemon_data_1_to_9 = await response.json();

  const pokemon_card = new pokenmon_card("card-container", "card-template");
  const pokedex = new display(pokemon_data_1_to_9, pokemon_card);

  pokedex.init();
});
