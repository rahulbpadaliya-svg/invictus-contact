import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

async function getAccessToken() {
  const url = "https://accounts.zoho.in/oauth/v2/token";
  const params = {
    refresh_token: process.env.ZOHO_REFRESH_TOKEN,
    client_id: process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
    grant_type: "refresh_token"
  };
  const res = await axios.post(url, null, { params });
  return res.data.access_token;
}

app.post("/submit-inquiry", async (req, res) => {
  try {
    const {
      full_name,
      mobile,
      email,
      destination,
      travel_date,
      travel_type,
      travelers,
      message
    } = req.body;

    const accessToken = await getAccessToken();

    await axios.post(
      "https://www.zohoapis.in/crm/v2/Leads",
      {
        data: [{
          Last_Name: full_name,
          Company: "Invictus Experiences",
          Phone: mobile,
          Email: email,
          Description: message,
          Destination_Tour: destination,
          Travel_Date: travel_date,
          Travel_Type: travel_type,
          Number_of_Travelers: travelers,
          Lead_Source: "Website"
        }]
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ status: "success" });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ status: "error" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
