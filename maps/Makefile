#
# Notes
#
# - Natural Earth data is already precut
# - Polygons are from land physical
# - Borders are from admin_0_countries using mapshaper -innerlines
#

land.json: shapefiles/ne_10m_admin_0_countries.shp

shapefiles/ne_10m_land.shp: ne_10m_land.zip
	unzip $< -0 -d shapefiles

# 10m physical
ne_10m_land.zip:
	curl 'https://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/physical/$@' -LO



border-points.json: borders.json
	# TODO: structure like Rich: indices = number of indices

borders.json: shapefiles/ne_10m_admin_0_countries.shp
	# TODO: some simplification
	mapshaper $< \
		-innerlines \
		-points vertices \
		-o $@ format=geojson

shapefiles/ne_10m_admin_0_countries.shp: ne_10m_admin_0_countries.zip
	unzip -o $< -d shapefiles

# 10m cultural
ne_10m_admin_0_countries.zip:
	curl 'https://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/$@' -LO

clean:
	rm -rf ne_10m_* borders* shapefiles
