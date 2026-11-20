# Leonida Trophy Atlas — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/xwb529/gta6-trophy-guide-01-leonida-atlas/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/xwb529/gta6-trophy-guide-01-leonida-atlas/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline web app that is both a guide and a tracker for all **55 PlayStation 5 trophies of Grand Theft Auto VI**: 1 platinum, 2 gold, 6 silver, 46 bronze.

## What it does

- **Every trophy, exactly as published** — official name, description and grade for all 55, in `app/data/trophies.json`.
- **A guide in our own words for every trophy** — what to do, where and how, and when it can be missed — with its sources named beside it (the official list as listed by Exophase and PSNProfiles; the PowerPyx roadmap as a strategy reference for the platinum path). Cited, never copied.
- **A tracker that remembers** — tick trophies off and progress is saved in your browser; export it to a file and import it back on another machine.
- **Filters that find things** — by kind (story, activities, collectibles, economy, completion), by grade, by search, and an only-unearned view.
- **Spoiler-safe mode** — story trophies' names and descriptions stay hidden until you earn them.
- **A platinum roadmap** — six stages built from the official descriptions, in the order to earn them, with the missable trophies flagged (three flags, each inferred from its official description and explained in its guide).

## Run it

```sh
node serve.ts   # then open http://localhost:8080
```

Or serve `app/` with any static file server. It works with the network off and fetches nothing.

## Hand it in (make.fun)

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library (`vendor/makefun-frontend.ts`, unchanged from the kit).

## License

MIT — see `LICENSE`. Trophy names and descriptions are PlayStation's, shown as published; everything else here is this entry's own work. No Rockstar logo or official artwork is used.
