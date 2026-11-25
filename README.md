<img src="docs/icon/lumen-icon.png" alt="Lumen icon" width="96" align="right">

# Lumen

A living-sky dashboard card for Home Assistant.

Lumen shows your whole house as glowing floors stacked on top of each other. Rooms light up when their lights are on, turn warm when they're heating and cool when they're cooling, and every room shows its temperature. Behind it all, the sky follows the real sun and weather: dawn, midday, sunset and night, plus rain, snow, fog, wind and the seasons.

![Whole house](docs/images/example-house.png)

## What it does

- **Whole house at a glance.** Every floor, every room, with a glow for lights and a tint for heating or cooling.
- **Tap to go deeper.** House, then room, then device, with full controls for heating dials and lights (brightness, warm or cool white, colour).
- **Draw your rooms.** Open a floor, tap **Edit layout**, then drag and resize the rooms to match your home. Overlaps turn red. Saving shares the plan with every screen. Only admins see the button.
- **Device rail.** Buttons for Lights, Heat, Media, Alerts and the rest open a list of every device of that type, with **All off**.
- **Counts on the rail.** A small number on each button shows how many of that type are on right now.
- **This screen's room.** Open a room and tap the star. That screen now opens on that room, and after 5 minutes without a touch it drifts back there, like a lift going home. Each screen remembers its own room.
- **Cameras.** Tap a camera to see its live picture, with whatever controls it offers in Home Assistant: arrows to point it, zoom, privacy and other switches.
- **Fits any screen.** Lumen measures itself and picks a layout: the full stacked house on big screens, the same stacked house on phones, with the device buttons along the top and the floor buttons along the bottom, and big simple buttons on small square wall screens (about 4 inches).
- **Settings and help.** A small gear at the top right opens settings for that screen (sky effects, layout, this screen's room, how long before it goes back) and a short **How to use Lumen** guide. It says which layout the screen is on and which features only appear on bigger screens.
- **Wall screens.** Add `?kiosk` to the dashboard address to hide Home Assistant's menus.

| Floor plan | Drawing rooms | Lights list |
|---|---|---|
| ![](docs/images/example-ground.png) | ![](docs/images/floor-editing.png) | ![](docs/images/rail-table.png) |

| Phone | Small wall screen | Camera |
|---|---|---|
| ![](docs/images/phone.png) | ![](docs/images/small.png) | ![](docs/images/camera.png) |

## Before you start

Lumen builds itself from Home Assistant's **floors** and **areas**, so set those up first:

1. Go to **Settings → Areas, labels & zones**.
2. Add your floors (Ground, First, Attic and so on).
3. Put each room (area) on its floor.
4. Put your devices in their rooms.

## Install

### Marketplace

Coming soon.

### By hand

1. Download `dist/lumen-card.js`.
2. Copy it into your Home Assistant `config/www/` folder.
3. Go to **Settings → Dashboards → ⋮ → Resources** and add `/local/lumen-card.js` as a **JavaScript module**.
4. Make a new dashboard, choose the **Panel** view type, and add this card:

```yaml
type: custom:lumen-card
```

## Options

```yaml
type: custom:lumen-card
effects: balanced   # subtle, balanced or showy: how much the sky moves
kiosk: false        # true hides Home Assistant's menus on this screen
settings: true      # false hides the gear button
phone_house: stack  # stack (3D floors) or list (flat floors you scroll) on phones
mode: auto          # auto, full, phone or small: force a layout instead of choosing by size
room: kitchen       # optional: the room a screen opens on if nobody has starred one
return_after: 5     # minutes without a touch before going back to the starred room (0 = never)
```

Room drawings are saved into the card as `layout:` by the **Edit layout** button. You don't need to type them.

## Testing

The `test/` folder has a pretend house (`test.html`) and scripts that drive it with Playwright:

```bash
cd test
node shot.js
```

## Support

Lumen is free. If it brightens your home, you can buy me a coffee (link coming soon).

---

Made by [rmclynch](https://github.com/rmclynch), with a nod to TelemIoT.
