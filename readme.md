# 🗺️ Pokedex Project
A interactive Pokemon catalog featuring stats from Generation 1 through 9.

## Features
* **Batch Pagination** — Navigate through the Pokedex using "Next" and "Previous" controls.
* **Random Mode** — Shuffle the entire database and discover Pokemon in a random order.
* **Live Sorting** — Sort Pokemon by any base stat (HP, ATK, DEF, etc.) or Total score, in both ascending and descending order.
* **Preloading** — Efficiently preloads images for a smooth browsing experience.

## File Structure
PokeDex/
├── index.html       # Page structure + card template
├── style.css        # Retro theme and card layouts
├── main.js          # Core logic: Display, Card Manager, and Data handling
└── data/
    └── pokemon_stats_1_9.json  # Comprehensive dataset of 1000+ Pokemon

## 📜 Credits & Data Source
This project uses the **Pokemon Complete Stats (Gen 1 - Gen 9)** dataset.
- **Author:** [Ibrahim Qasimi](https://www.kaggle.com/ibrahimqasimi)
- **Source:** [Kaggle Dataset](https://www.kaggle.com/datasets/ibrahimqasimi/pokemon-complete-stats-gen-1-to-gen-9)
- **License:** Apache License 2.0

Image Source
- **PokeAPI:** Official artwork sourced via GitHub [PokeAPI/sprites](https://github.com/PokeAPI/sprites).

## Reference: 
Implementation inspired by this [Stack Overflow discussion](https://stackoverflow.com/questions/69239521/unable-to-display-pokemon-image-from-pokeapi-co) regarding PokeAPI image rendering.
Generated from [stage-2-SEA-Project](https://github.com/Snap-Engineering-Academy-2026/stage-2-SEA-Project)


