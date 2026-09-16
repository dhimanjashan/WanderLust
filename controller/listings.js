const Listing = require("../models/listing");
const { geocoding } = require("@maptiler/client");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not existed!");
    res.redirect("/listings");
  } else {
    console.log(listing.geometry.coordinates);
    res.render("listings/show.ejs", {
      listing,
      mapToken: process.env.MAP_TOKEN,
    });
  }
};

module.exports.createListing = async (req, res) => {
  const response = await fetch(
    `https://api.maptiler.com/geocoding/${encodeURIComponent(req.body.listing.location)}.json?key=${process.env.MAP_TOKEN}`,
  );

  const data = await response.json();
  const coordinates = data.features[0].geometry;
  const url = req.file.path;
  const filename = req.file.filename;
  const listingData = { ...req.body.listing };
  listingData.image = {
    url: listingData.image,
  };
  const newListing = new Listing(listingData);
  newListing.owner = req.user._id;
  newListing.image = { filename, url };
  newListing.geometry = coordinates;
  const savedListing = await newListing.save();
  console.log(savedListing);
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not existed!");
    res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listingData = { ...req.body.listing };
  if (typeof req.file !== "undefined") {
    const url = req.file.path;
    const filename = req.file.filename;
    listingData.image = { url, filename };
  }
  await Listing.findByIdAndUpdate(id, listingData);
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect(`/listings`);
};
