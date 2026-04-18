
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
    const totalStats =
      pokemon.hp +
      pokemon.attack +
      pokemon.defense +
      pokemon.sp_attack +
      pokemon.sp_defense +
      pokemon.speed;
    const stats = `HP: ${pokemon.hp} | ATK: ${pokemon.attack} | DEF: ${pokemon.defense} 
    | Sp. ATK: ${pokemon.sp_attack} | Sp. DEF: ${pokemon.sp_defense}| SPD: ${pokemon.speed}
    Tot : ${totalStats}`;

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
  shuffled_array (array){
    return [...array].sort(() => Math.random() - 0.5)
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