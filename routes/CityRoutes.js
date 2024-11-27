const express = require('express');
const City = require("../models/City");
const Area = require("../models/Area");
const router = express.Router();

// Add a new city with specific areas
router.post('/api/cities', async (req, res) => {
  try {
    const { name, areas } = req.body;

    // Ensure the `areas` property is an array, even if empty
    if (!Array.isArray(areas)) {
      return res.status(400).json({ message: "Areas should be an array" });
    }

    // Check if a city with the same name already exists
    const existingCity = await City.findOne({ name });
    if (existingCity) {
      return res.status(400).json({ message: "City with this name already exists" });
    }

    // Create a new city with the areas array, even if it's empty
    const city = new City({ name, areas });
    await city.save();
    res.status(201).json(city);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Get all cities with their areas
router.get('/api/cities', async (req, res) => {
  try {
    const cities = await City.find().populate('areas');
    res.json(cities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a city's name or areas
router.put('/api/cities/:cityId', async (req, res) => {
  try {
    const { cityId } = req.params;
    const { name, areas } = req.body;

    const city = await City.findById(cityId);
    if (!city) return res.status(404).json({ message: "City not found" });

    // Check if another city with the same name exists
    if (name && name !== city.name) {
      const existingCity = await City.findOne({ name });
      if (existingCity) return res.status(400).json({ message: "City with this name already exists" });
      city.name = name;
    }

    // Update areas if provided
    if (areas) {
      await Area.deleteMany({ cityId });
      const areaDocs = areas.map(areaName => ({ name: areaName, cityId }));
      await Area.insertMany(areaDocs);
    }

    await city.save();
    res.json(city);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a city and its areas
router.delete('/api/cities/:cityId', async (req, res) => {
  try {
    const { cityId } = req.params;

    // Use deleteOne instead of remove
    const result = await City.deleteOne({ _id: cityId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'City not found' });
    }

    res.status(200).json({ message: 'City deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add a new area to a specific city
router.post('/api/cities/:cityName/areas', async (req, res) => {
  try {
    const { cityName } = req.params;
    const { name } = req.body;

    const city = await City.findOne({ name: cityName });
    if (!city) return res.status(404).json({ message: "City not found" });

    const newArea = new Area({ name, cityId: city._id });
    await newArea.save();
    city.areas.push(newArea.name);  // Add the area to the city's areas array
    await city.save();

    res.status(201).json(newArea);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// Get areas by city ID
router.get('/api/areas/:cityName', async (req, res) => {
  try {
    const { cityName } = req.params;

    // Find the city by its name and return only the areas array
    const city = await City.findOne({ name: cityName }).select('areas');
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }

    res.json(city.areas); // Respond with the areas array only
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an area in a specific city
router.put('/api/cities/:cityId/areas/:areaId', async (req, res) => {
  try {
    const { cityId, areaId } = req.params;
    const { name } = req.body;

    const area = await Area.findOne({ _id: areaId, cityId });
    if (!area) return res.status(404).json({ message: "Area not found in this city" });

    area.name = name;
    await area.save();
    res.json(area);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an area from a specific city
router.delete('/api/cities/:cityId/areas/:areaId', async (req, res) => {
  const { cityId, areaId } = req.params;

  console.log('Received cityId:', cityId);
  console.log('Received areaId:', areaId); // Log both IDs to debug

  try {
    const area = await Area.findOneAndDelete({ _id: areaId, cityId });
    if (!area) return res.status(404).json({ message: "Area not found in this city" });

    await City.findByIdAndUpdate(cityId, { $pull: { areas: areaId } });
    res.json({ message: "Area deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log("Error:", error);
  }
});

module.exports = router;
