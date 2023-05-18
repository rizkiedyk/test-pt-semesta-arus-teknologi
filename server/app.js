import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { AccessToken } from "livekit-server-sdk";
import * as dotenv from "dotenv";

dotenv.config();

const createToken = (credentials) => {
  const roomName = credentials.room_name;
  const participantName = credentials.username;
  console.log("test", credentials);
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_SECRET_KEY,
    {
      identity: participantName,
    },
  );
  at.addGrant({ roomJoin: true, room: roomName });

  return at.toJwt();
};

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.post("/api/token", (req, res) => {
  const token = createToken(req.body);

  res.json({
    token: token,
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
