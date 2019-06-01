# Gufitrup - Experiment

**Important: I don't own any of the sprites used here and this is just an study experiment, nothing is for sale here!**

The Gufitrup Experiment is a Javascript Game created from scratch. My intention was to remake the old SNES game, Goof Troop, in pure Javascript with the intention on learning Game Development.

This is not a full game remake, it's just a sandbox where I could learn something about game mechanics and have fun in te proccess.

Fell free to ask me any question about it ou even teach me something, let's learn together. There is still a lot Work to do.

[CHECK OUT THE DEMO HERE](http://daniofilho.com.br/gufitrupi)

- - -

### Map Editor

To draw a net Stage, first you must download [Tile](https://www.mapeditor.org/) software, we will use it as the Map editor.

#### Tileset

The first step is to create a new Tileset. The Tileset is a collection of tiles that you must configure before starting the map creation proccess.

On Tile, go to File > New > New Tileset.

Define your Tileset name, set the width and height of each tile and choose the image you will use.

![](http://daniofilho.com.br/gufitrupi-assets/tileset01.jpg)

Now the proccess is simple, but you need to be careful. Select each of the tiles and add two props: **class** and **type**. This two variables are needed because they will store what class the tile belongs and what type of tile is that.

For example, if you need to make a ground tile, select the tile and set the class to **beach_floor**, and then set the type.

![](http://daniofilho.com.br/gufitrupi-assets/tileset02.jpg)

This will be used by the Stage class to load the corresponded tile.

Code reference: 
- Check Stage class and loadJSON function.
- Check GlobalAssets class and getAsset function.

*Important note:* You **must** configure the tile on each class before starting this proccess. 

#### Map

Now go to File > New > New Map.

![](http://daniofilho.com.br/gufitrupi-assets/map01.jpg)

*A:* Make sure this option is selected because it will set the direction tiles will be saved. It's important to define that they will start on the top left.

*B:* This will have to be corresponded to you Game Properties.

*C:* Make sure to set the same width of the tiles

Now, have fun creating the map using the tiles as you wish. But, just make sure to include some layers with exactly the same name:
**saved-items**: The saved items will be loaded in this layer.
**player**: The player will be loaded in this layer.
**assets**: In this layer you can include the Dialogs and Teleports. To do that you must include a json file in the same folder as the map. When the code find this layer, it will load the json assets.