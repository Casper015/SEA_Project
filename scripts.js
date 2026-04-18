
class display {

  constructor(data, card_manager) {
    this.database = data;
    this.pokemon_manager = card_manager;
    
    this.shuffled_pokemon = untils.shuffled_array(this.database);
    this.current_index = 0;
    
    this.current_batch = [];
    this.next_batch = [];

    this.display_count = 3;
  }

  // Shuffle random pokemon from the database
  draw_pokemon() {
    
    // If We've drawn all cards, reshuffle and start over
    if (this.current_index + this.display_count > this.shuffled_pokemon.length) {
      console.log("All pokemon drawn, reshuffling...");
      this.shuffled_pokemon = untils.shuffled_array(this.database)
      this.current_index = 0;
    }

    // Select the next batch of pokemon
    const selected = this.shuffled_pokemon.slice(
      this.current_index, 
      this.current_index + 
      this.display_count);

    this.current_index += this.display_count;

    console.log("Drew pokemon:", selected);
    return selected;
  }

  // Preload image for refreshing page faster
  preload_images(batch) {
    batch.forEach((pokemon) => {
      const img = new Image();
      img.src = untils.getSpriteUrl(pokemon.id);
    });
  }

  // Initialize
  init() {
    this.current_batch = this.draw_pokemon();
    this.next_batch = this.draw_pokemon();

    this.preload_images(this.next_batch);
    this.pokemon_manager.display_cards(this.current_batch);
    console.log("----- Pokedex initialized -----");
  }

  // Pre-loading
  load_next_batch() {
    this.current_batch = this.next_batch;
    this.pokemon_manager.display_cards(this.current_batch);

    this.next_batch = this.draw_pokemon();
    this.preload_images(this.next_batch);
    console.log("----- Loaded next batch of pokemon -----");
  }

  sort_by_stat(stat_name) {
    const sorted = untils.sort_array(this.shuffled_pokemon, stat_name);
    this.shuffled_pokemon = sorted;
    this.current_index = 0;
    console.log(`Pokemon sorted by ${stat_name}`);
  }
}

class pokenmon_card {

  constructor(container_id, template_id) {
    this.container = document.getElementById(container_id);
    this.template = document.getElementById(template_id);
  }

  display_cards(batch) {
    if (!this.template || !this.container) return;

    this.container.innerHTML = "";
    const temp_box = document.createDocumentFragment();

    batch.forEach((pokemon) => {
      const card_clone = this.create_single_card(pokemon, this.template);
      temp_box.appendChild(card_clone);
    });
    this.container.appendChild(temp_box);
    console.log("Cards displayed");
  }

  // Create a single card element
  create_single_card(pokemon, template) {
    const card_clone = template.content.cloneNode(true);
    
    // Set image source
    const imgElement = card_clone.querySelector(".card-img");
    imgElement.src = untils.getSpriteUrl(pokemon.id);
    imgElement.alt = pokemon.name;

    // Format types，some pokemon have two types, some only have one
    let types_string;
      if (pokemon.type2) {
        types_string = `${pokemon.type1}, ${pokemon.type2}`;
      } else {
        types_string = pokemon.type1;
      }
    
    // Format abilities, height and weight, stats
    const abilities = untils.formatted_abilities(pokemon.abilities);
    const heightWeight = `Height: ${pokemon.height / 10}m | Weight: ${pokemon.weight / 10}kg`;
    const stats = untils.format_stats(pokemon);

    // Set text content for the card
    untils.set_text(card_clone, ".card-title", pokemon.name.toUpperCase());
    untils.set_text(card_clone, ".card-type", `TYPE: ${types_string.toUpperCase()}`);
    untils.set_text(card_clone, ".card-id", `ID: ${pokemon.id}`);
    untils.set_text(card_clone, ".card-h_weight", heightWeight);
    untils.set_text(card_clone, ".card-stats", stats);
    untils.set_text(card_clone, ".card-ability", `ABILITIES: ${abilities}`);
    
    return card_clone;
  }

}

const untils = {
  
  pokemon_stats: ["hp", "attack", "defense", "sp_attack", "sp_defense", "speed"],
  pokemon_max_stats: [255, 181, 230, 173, 230, 200],

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
    const formatted_array = this.pokemon_stats.map((stat) => {
      const label = this.stat_labels[stat];
      const value = pokemon[stat];
      const max_value = this.pokemon_max_stats[this.pokemon_stats.indexOf(stat)];
      return `${label}: ${value}/${max_value}`;
    });

    const stats_string = formatted_array.join(" | ");
    const total_score = this.pokemon_stats.reduce((sum, key) => {
      const value = pokemon[key];
      return sum + value;
    }, 0);

    return `${stats_string} | Tot: ${total_score}`;
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
  getSpriteUrl(pokemon_id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon_id}.png`;
  },

  // Helper function to set text content
  set_text(card_clone, selector, value) {
    const element = card_clone.querySelector(selector);
    if (element) {
      element.textContent = value;
    }
  },

  sort_array(arr, key) {
    if (arr.length <= 1) {
      return arr;
    }

    // find mid element index
    const mid = Math.floor(arr.length / 2);

    // left and right halves
    const left = this.sort_array(arr.slice(0, mid), key);
    const right = this.sort_array(arr.slice(mid), key);

    return this.merge_arrays(left, right, key);
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

  const next_button = document.getElementById("next-batch");
  next_button.addEventListener("click", () => {
    console.log("Next button clicked");
    pokedex.load_next_batch();
  });
});