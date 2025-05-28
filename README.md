# Flood Risk Classification System

## Introduction

The **Flood Risk Classification System** is an interactive web application built using Google Earth Engine (GEE) to classify and visualize flood risk across Pakistan’s districts. By integrating historical and near real-time spatial datasets, it provides composite risk scores to support pre-disaster planning, academic research, and civic awareness. The system is designed for environmental analysts, policymakers, and community stakeholders.

## System Overview

### Objectives
- Enable district-level flood risk classification using historical and near real-time data.
- Provide a user-friendly interface for customizing risk classifications and viewing individual datasets.
- Support decision-making for disaster preparedness and research.

### Target Audience
- **Environmental Analysts**: For studying flood patterns.
- **Policymakers and Disaster Management Authorities**: For planning and response.
- **Community Organizations**: For promoting flood risk awareness.

## Key Features
- **District-Based Selection**: Search and select any district, with the map zooming to its boundaries.
- **Integrated Risk Classification**: Combines four datasets:
  - **Historical Flood Events** (2000–2018, Global Flood Database, GFD).
  - **Elevation Data** (SRTM, lower elevations indicate higher risk).
  - **Recent Rainfall** (CHIRPS, past 90 days).
  - **Precipitable Water Forecast** (GFS, next 5 days).
- **Individual Layer Display**: View risk layers for each dataset (GFD, CHIRPS, Elevation, GFS) individually, with colors representing:
  - Green (Low, score < 2)
  - Yellow (Moderate, 2–6)
  - Red (High, ≥ 6)
  - Risk scores are derived from natural breaks in the combined dataset histogram.
- **Weight Customization**: Sliders adjust dataset contributions (0–100), with normalized weights for consistent classifications.
- **Risk Classification**: Visualizes composite risk as:
  - Green (Low, score < 2)
  - Yellow (Moderate, 2–6)
  - Red (High, ≥ 6)
- **Interactive Map**: Includes a color-coded legend, district information panel, reset option, and an “App Info” panel with a documentation link.

## Access Link:
  https://umarhabib464.users.earthengine.app/view/gisfloodriskanalysis

## How to Use the System

### Step 1: Select a District
- Enter a district name (e.g., Lahore) in the search bar.
- Select from the filtered suggestions; the map will highlight and zoom to the selected district.

### Step 2: Adjust Dataset Weights
- Use the sliders to set weights for Historical Flood, Rainfall, Elevation, and Forecast datasets.
- Default weights are set to 30 (GFD), 20 (CHIRPS), 25 (Elevation), and 25 (GFS), which balance contributions. Weights are automatically normalized.

### Step 3: View Flood Risk Results
- The composite risk is displayed as a color-coded district:
  - **Green**: Low risk (score < 2)
  - **Yellow**: Moderate risk (2–6)
  - **Red**: High risk (≥ 6)
- Toggle individual dataset layers (GFD, CHIRPS, Elevation, GFS) in the map’s layer panel to view their risk contributions, using the same color scheme.
- The information panel displays the district name and composite risk level with an emoji (🟢 for Low, 🟡 for Moderate, 🔴 for High).

### Step 4: Access App Info
- Click the “App Info” panel (top-right) for an overview and a link to the full documentation.
- Close the panel using the ❌ button.

### Step 5: Reset the View
- Click “Reset View” to clear selections and return the map to Pakistan’s default view.

## Data Sources
- **Global Flood Database (GFD)**: Historical flood events (2000–2018).
- **SRTM (Shuttle Radar Topography Mission)**: Elevation data, where lower elevations indicate higher flood risk.
- **CHIRPS (Climate Hazards Group InfraRed Precipitation with Station data)**: Rainfall data for the past 90 days.
- **GFS (Global Forecast System)**: Precipitable water forecast for the next 5 days.

## Technical Details
- **Platform**: Google Earth Engine (JavaScript API).
- **Datasets**:
  - GFD: `GLOBAL_FLOOD_DB/MODIS_EVENTS/V1`
  - SRTM: `USGS/SRTMGL1_003`
  - CHIRPS: `UCSB-CHG/CHIRPS/DAILY`
  - GFS: `NOAA/GFS0P25`
- **Administrative Boundaries**: FAO GAUL Simplified 500m (2015, level 2).
- **Risk Calculation**:
  - Weighted sum of normalized dataset values, with weights adjusted via sliders.
  - Risk classification uses natural breaks: Low (< 2), Moderate (2–6), High (≥ 6).
- **UI Components**:
  - Search bar for district selection.
  - Sliders for dataset weight customization.
  - Interactive map with layer toggles and a color-coded legend.
  - Information panel for district-specific risk output.


## Future Improvements
- Integrate higher-resolution datasets for improved accuracy.
- Add temporal filters for historical and forecast data.
- Include additional risk factors, such as land use or population density.
- Enhance UI with export options for risk maps and data.

## Documentation
For detailed information, refer to the full documentation:  
[📄 View Full Documentation](https://drive.google.com/file/d/12l5YvPreNiNLYHSyVbLuGF2sze42kWZP/view?usp=sharing)
---
