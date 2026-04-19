
class display {

  constructor(data, card_manager) {
    this.database = data;
    this.pokemon_manager = card_manager;
    
    this.current_batch = [];
    this.next_batch = [];

    this.display_count = 3;
    this.active_sort_key = "";
    this.ascending = true;

    this.pokemon_data = new pokemon_data(this.database, this.display_count);
  }

  // Initialize
  init() {
    this.setup_controls();
    this.refresh_batches();
    console.log("----- Pokedex initialized -----");
  }

  setup_controls() {
    // Random Pokemon Button
    const next_button = document.getElementById("next-batch");
    // sort dropdown
    const sort_dropdown = document.getElementById("sort-dropdown");
    // switch button
    const switch_button = document.getElementById("sort-order-btn");

    this.next_button = next_button;
    this.sort_dropdown = sort_dropdown;
    this.switch_button = switch_button;

    if (next_button) {
      next_button.addEventListener("click", () => {
        console.log("Next button clicked");
        this.load_random_next_batch();
      });
    }

    if (sort_dropdown) {
      this.populate_sort_dropdown();
      sort_dropdown.addEventListener("change", (event) => {
        this.sort_by_stat(event.target.value);
      });
    }

    if (switch_button) {
      switch_button.textContent = this.ascending ? "Ascending" : "Descending";
      switch_button.addEventListener("click", () => {

        let selected_key;
        if (this.sort_dropdown) {
          selected_key = this.sort_dropdown.value;
        } else {
          selected_key = this.active_sort_key;
        }

        if (!selected_key) {
          console.log("No sort key selected, order toggle ignored");
          return;
        }

        this.active_sort_key = selected_key;
        this.ascending = !this.ascending;
        switch_button.textContent = this.ascending ? "Ascending" : "Descending";
        this.sort_by_stat(selected_key);
      });
    }
  }

  // Load next random batch of pokemon
  load_random_next_batch() {
    const { pokemon_data, pokemon_manager } = this;

    if (this.active_sort_key) {
      this.active_sort_key = "";
      this.ascending = true;

      if (this.sort_dropdown) {
        this.sort_dropdown.value = "";
      }
      if (this.switch_button) {
        this.switch_button.textContent = "Ascending";
      }

      pokemon_data.apply_sort_by_stat("", this.ascending);
      this.refresh_batches();
      console.log("Switched to random mode");
      return;
    }

    this.current_batch = this.next_batch;
    pokemon_manager.display_cards(this.current_batch);

    this.next_batch = pokemon_data.draw_pokemon();
    untils.preload_images(this.next_batch);
    console.log("----- Loaded next batch of pokemon -----");
  }

  sort_by_stat(stat_name) {
    const { pokemon_data } = this;

    this.active_sort_key = stat_name;

    pokemon_data.apply_sort_by_stat(stat_name, this.ascending);
    this.refresh_batches();

    if (!stat_name) {
      console.log("Sort cleared, switched back to random mode");
      return;
    }

    console.log(`Applied sort by ${stat_name} in ${this.ascending ? "ascending" : "descending"} order`);
  }


  populate_sort_dropdown() {
    const { sort_dropdown } = this;
    sort_dropdown.innerHTML = "";

    const place_holder = document.createElement("option");
    place_holder.value = "";
    place_holder.textContent = "Sort by Stats... (sort)";
    sort_dropdown.appendChild(place_holder);

    untils.pokemon_stats.forEach((stat) => {
      const option = document.createElement("option");
      option.value = stat;
      option.textContent = untils.stat_labels[stat];
      sort_dropdown.appendChild(option);
    });
  }

  populate_sort_riseup(){
    const { sort_dropdown } = this;
    sort_riseup.innerHTML = "";

  }

  
  next_button (){}
  before_button (){}

  refresh_batches() {
    const { pokemon_data, pokemon_manager } = this;

    this.current_batch = pokemon_data.draw_pokemon();
    this.next_batch = pokemon_data.draw_pokemon();

    pokemon_manager.display_cards(this.current_batch);
    untils.preload_images(this.next_batch);
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
    img_element.src = untils.get_sprite_url(pokemon.id);
    img_element.alt = pokemon.name;

    // Format types，some pokemon have two types, some only have one
    let types_string;
      if (pokemon.type2) {
        types_string = `${pokemon.type1}, ${pokemon.type2}`;
      } else {
        types_string = pokemon.type1;
      }
    
    // Format abilities, height and weight, stats
    const abilities = untils.formatted_abilities(pokemon.abilities);
    const height_weight = `Height: ${pokemon.height / 10}m | Weight: ${pokemon.weight / 10}kg`;
    const stats = untils.format_stats(pokemon);

    // Set text content for the card
    untils.set_text(card_clone, ".card-title", pokemon.name.toUpperCase());
    untils.set_text(card_clone, ".card-type", `TYPE: ${types_string.toUpperCase()}`);
    untils.set_text(card_clone, ".card-id", `ID: ${pokemon.id}`);
    untils.set_text(card_clone, ".card-h_weight", height_weight);
    untils.set_inner_html(card_clone, ".card-stats", stats);
    untils.set_text(card_clone, ".card-ability", `ABILITIES: ${abilities}`);
    
    return card_clone;
  }

}

class pokemon_data{
  constructor(data, display_count){
    this.database = data;
    this.display_count = display_count;
    
    this.current_index = 0;
    this.random_pokemon = untils.shuffled_array(this.database);
    this.ordered_pokemon = this.random_pokemon;
    
    this.active_sort_key = "";
    this.sorted_cache = {};
    this.sorted_cache_order = {};
  } 

  // Shuffle random pokemon from the database
  draw_pokemon() {
    
    //drawn all cards reshuffle and start over
    if (this.current_index + this.display_count > this.ordered_pokemon.length) {
      if (this.active_sort_key) {
        console.log("Reached end of sorted list, restarting from top...");
      } else {
        console.log("All pokemon drawn, reshuffling...");
        this.random_pokemon = untils.shuffled_array(this.database);
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
    this.active_sort_key = stat_name;
    
    if (!stat_name) {
      this.active_sort_key = "";
      this.ordered_pokemon = this.random_pokemon;
      return;
    }

    if (!this.sorted_cache[stat_name]) {
      this.sorted_cache[stat_name] = untils.sort_array(this.database, stat_name);
      this.sorted_cache_order[stat_name] = "asc";
    }

    const target_order = ascending ? "asc" : "desc";
    if (this.sorted_cache_order[stat_name] !== target_order) {
      // Reverse in place to avoid re-sorting and extra array allocation.
      this.sorted_cache[stat_name].reverse();
      this.sorted_cache_order[stat_name] = target_order;
    }

    this.active_sort_key = stat_name;
    this.ordered_pokemon = this.sorted_cache[stat_name];
    this.current_index = 0;
  }


  sort_by(key){
    return untils.sort_array([...this.database], key);
  }
   
  filter_by(type){

  }
}

const untils = {
  
  pokemon_stats: ["hp", "attack", "defense", "sp_attack", "sp_defense", "speed"],
  pokemon_max_stats: [255, 181, 230, 173, 230, 200, 720],

  stat_labels: {
    hp: "HP",
    attack: "ATK",
    defense: "DEF",
    sp_attack: "Sp. ATK",
    sp_defense: "Sp. DEF",
    speed: "SPD"
  },

  // Format base stats and total score
  format_stats(pokemon) {
    const { pokemon_stats, stat_labels, pokemon_max_stats } = untils;

    const formatted_array = pokemon_stats.map((stat, index) => {
      const label = stat_labels[stat];
      const value = pokemon[stat];
      const max_value = pokemon_max_stats[index];
      return `${label}: ${value}/${max_value}` ;
    });

    const stats_string = formatted_array.join("<br>");
    const total_score = pokemon_stats.reduce((sum, key) => {
      const value = pokemon[key];
      return sum + value;
    }, 0);

    const max_total = pokemon_max_stats[6];
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
      img.src = untils.get_sprite_url(pokemon.id);
    });
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

  // 2way sort function
  sort_array(arr, key) {
    if (arr.length <= 1) {
      return arr;
    }

    // find mid element index
    const mid = Math.floor(arr.length / 2);

    // left and right halves
    const left = untils.sort_array(arr.slice(0, mid), key);
    const right = untils.sort_array(arr.slice(mid), key);

    return untils.merge_arrays(left, right, key);
  },

  merge_arrays(left, right, key) {
    const merged = [];
    let i = 0, j = 0;

    while (i < left.length && j < right.length) {
      // insert the smallest element into the merged array
      if (left[i][key] < right[j][key]) {
        merged.push(left[i]);
        i++;
      } else {
        merged.push(right[j]);
        j++;
      }
    }

    return merged.concat(left.slice(i)).concat(right.slice(j));
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const pokemon_card = new pokenmon_card("card-container", "card-template");
  const pokedex = new display(pokemon_data_1_to_9, pokemon_card);

  pokedex.init();
});