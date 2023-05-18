<script lang="js">
  import { Room, createLocalTracks, RoomEvent } from "livekit-client";
  import { Button, Row, Col, Container, FormGroup, Input } from "sveltestrap";
  import axios from "axios";

  let room;
  let visible = false;

  let credentials = [
    {
      username: "",
      roomName: "",
    },
  ];

  const fillForm = (e) => {
    credentials[e.target.name] = e.target.value;
  };

  const getToken = async (username, roomName) => {
    const response = await axios.post("http://localhost:3000/api/token", {
      username: username,
      roomName: roomName,
    });

    return response.data;
  };

  const join = async () => {
    if (
      credentials.username == undefined ||
      credentials.roomName == undefined
    ) {
      alert("username and room name cannot be empty");
      return;
    }

    try {
      const generate = await getToken(
        credentials.username,
        credentials.roomName,
      );
      const token = generate.token;

      const url = "wss://test-semesta-arus-teknologi-538qb20x.livekit.cloud";

      room = await new Room();
      await room.connect(url, token);

      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        console.log("Participant Subscribed");
        attachTrack(track, participant);
      });

      const tracks = await createLocalTracks({
        audio: true,
        video: true,
      });
      for (let track of tracks) {
        await room.localParticipant.publishTrack(track);

        console.log("Publishing Track");
        console.log(track);
        if (track.kind === "video") {
          const v = document.getElementById("us");
          track.attach(v);
        }
      }

      visible = !visible;
    } catch (error) {
      console.log("error when connect to livekit ", error);
    }
  };

  const disconnect = async () => {
    await room.disconnect();
    visible = !visible;
  };

  const attachTrack = (track, participant) => {
    const v = document.getElementById("them");
    track.attach(v);
  };
</script>

<main>
  <Container>
    <div class="w-100 d-flex mt-5">
      <h1 class="mb-5 m-auto">Video Call</h1>
    </div>

    <!-- <div id="video-grid"> -->
    <Row class="w-100">
      <Col md="6">
        <video id="us" controls autoplay class="w-100" />
      </Col>
      <Col md="6">
        <video id="them" controls autoplay class="w-100" />
      </Col>
    </Row>
    <!-- </div> -->

    {#if !visible}
      <FormGroup floating label="Username">
        <Input placeholder="Username" name="username" on:input={fillForm} />
      </FormGroup>

      <FormGroup floating label="Room Name">
        <Input placeholder="Room Name" name="roomName" on:input={fillForm} />
      </FormGroup>
      <Button on:click={join}>Join</Button>
    {/if}

    {#if visible}
      <Row class="w-100 mt-3">
        <Col>
          <Button
            id="dissconnect"
            color="danger"
            class="px-5"
            on:click={disconnect}>Stop</Button
          >
        </Col>
      </Row>
    {/if}
  </Container>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    text-align: center;
  }

  /* #video-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
    margin-bottom: 16px;
  }

  video {
    max-width: 400px;
    max-height: 300px;
  } */
</style>
