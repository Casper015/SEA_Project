/**
 * Data Catalog Project Starter Code - SEA Stage 2
 *
 * This file is where you should be doing most of your work. You should
 * also make changes to the HTML and CSS files, but we want you to prioritize
 * demonstrating your understanding of data structures, and you'll do that
 * with the JavaScript code you write in this file.
 *
 * The comments in this file are only to help you learn how the starter code
 * works. The instructions for the project are in the README. That said, here
 * are the three things you should do first to learn about the starter code:
 * - 1 - Change something small in index.html or style.css, then reload your
 *    browser and make sure you can see that change.
 * - 2 - On your browser, right click anywhere on the page and select
 *    "Inspect" to open the browser developer tools. Then, go to the "console"
 *    tab in the new window that opened up. This console is where you will see
 *    JavaScript errors and logs, which is extremely helpful for debugging.
 *    (These instructions assume you're using Chrome, opening developer tools
 *    may be different on other browsers. We suggest using Chrome.)
 * - 3 - Add another string to the titles array a few lines down. Reload your
 *    browser and observe what happens. You should see a fourth "card" appear
 *    with the string you added to the array, but a broken image.
 *
 */

class pokenmon {

  constructor(data) {
    this.database = data;
    this.current_batch = [];
    this.next_batch = [];
    this.display_count = 3;
  }

  // Shuffle random pokemon from the database
  draw_pokemon() {
    const shuffle_pokemon = [...this.database].sort(
      () => Math.random() - 0.5,
    );
    return shuffle_pokemon.slice(0, this.display_count);
  }

  // Preload image for refreshing page faster
  preload_next_pokemon(batch) {
    batch.forEach((pokemon) => {
      const img = new Image();
      img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
    });
  }

  // Format abilities 
  formatted_abilities(abilities_string) {
    if (!abilities_string) {
      return "None";
    }
    return abilities_string
      .split(",")
      .map((ability) => ability.trim())
      .map((ability) => {
        return ability.charAt(0).toUpperCase() + ability.slice(1);
      })
      .join(", ");
  }

  // Helper function to set text content
  set_text = (card_clone, selector, value) => {
    const element = card_clone.querySelector(selector);
    if (element) {
      element.textContent = value;
    }
  };

  // Create a single card element
  create_single_card(pokemon, template) {
    const card_clone = template.content.cloneNode(true);
    
    // Set image source
    const img_element = card_clone.querySelector(".card-img");
    img_element.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
    img_element.alt = pokemon.name;

    // Format types，some pokemon have two types, some only have one
    let types_string;
      if (pokemon.type2) {
        types_string = `${pokemon.type1}, ${pokemon.type2}`;
      } else {
        types_string = pokemon.type1;
      }
    
    // Format abilities, height and weight, stats
    const abilities_array = this.formatted_abilities(pokemon.abilities);
    const h_weight = `Height: ${pokemon.height / 10}m | Weight: ${pokemon.weight / 10}kg`;
    let stats = `HP: ${pokemon.hp} | ATK: ${pokemon.attack} | DEF: ${pokemon.defense} 
    | Sp. ATK: ${pokemon.sp_attack} | Sp. DEF: ${pokemon.sp_defense}| SPD: ${pokemon.speed}
    Tot : ${pokemon.hp + pokemon.attack + pokemon.defense + pokemon.sp_attack + pokemon.sp_defense + pokemon.speed}`;

    // Set text content for the card
    this.set_text(card_clone, ".card-title", pokemon.name.toUpperCase());
    this.set_text(card_clone, ".card-type", `TYPE: ${types_string.toUpperCase()}`);
    this.set_text(card_clone, ".card-id", `ID: ${pokemon.id}`);
    this.set_text(card_clone, ".card-h_weight", h_weight);
    this.set_text(card_clone, ".card-stats", stats);
    this.set_text(card_clone, ".card-ability", `ABILITIES: ${abilities_array}`);
    
    return card_clone;
  }

  // Render multiple cards on the page
  display_cards(batch_to_display) {

    const card_container = document.getElementById("card-container");
    card_container.innerHTML = "";
    const template = document.getElementById("card-template");

    if (!template || !card_container) {
      return;
    }

    const temp_box = document.createDocumentFragment();

    batch_to_display.forEach((pokemon) => {
      const finished_card = this.create_single_card(pokemon, template);
      temp_box.appendChild(finished_card);
    });

    card_container.appendChild(temp_box);
  }

  // Initialize
  init() {
    this.current_batch = this.draw_pokemon();
    this.next_batch = this.draw_pokemon();

    this.preload_next_pokemon(this.next_batch);
    this.display_cards(this.current_batch);
  }

  // Pre-loading
  load_next_batch() {
    this.current_batch = this.next_batch;
    this.display_cards(this.current_batch);

    this.next_batch = this.draw_pokemon();
    this.preload_next_pokemon(this.next_batch);
  }
}

const poke_dex_1 = new pokenmon(pokemon_data);

document.addEventListener("DOMContentLoaded", () => poke_dex_1.init());