export const getUserLocation = async () => {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
  
      if (data && data.city && data.region && data.country_name) {
        return `${data.city}, ${data.region}, ${data.country_name}`;
      } else {
        return "Location not available";
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      return "Location not available";
    }
  };
  