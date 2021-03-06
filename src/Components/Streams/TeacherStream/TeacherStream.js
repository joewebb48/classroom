import React, { useEffect, useState, memo } from "react";
import PrimaryButton from "./../../Buttons/PrimaryButton";

import { OTPublisher, OTSubscriber, createSession } from "opentok-react";

import "./TeacherStream.scss";
import Axios from "axios";
import SecondaryButton from "../../Buttons/SecondaryButton";

const TeacherStream = props => {
  const [streams, setStreams] = useState([]);
  const [publish, setPublish] = useState(false);
  const [lectures, setLectures] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState({});
  const [record, setRecord] = useState(false);
  const { session_id, token, course_id } = props;
  const [source, setSource] = useState("");

  const sessionHelper = createSession({
    apiKey: process.env.REACT_APP_OPENTOK_API_KEY,
    sessionId: session_id,
    token: token,
    onStreamsUpdated: streams => {
      setStreams(streams);
    }
  });
  // let sessionHelper = {}

  useEffect(() => {
    getLectures();
    return () => {
      sessionHelper.disconnect();
    };
  }, []);

  const getLectures = async () => {
    const lRes = await Axios.get(`/info/lectures/course/${course_id}`);
    setLectures(lRes.data);
  };

  const mappedStreams = streams.map(stream => {
    return (
      <div className='subscriber'>
      <OTSubscriber
        key={stream.id}
        session={sessionHelper.session}
        stream={stream}
        properties={{width: '35.5vh', height: '20vh', insertMode: 'append'}}
      />
      </div>
    );
  });

  const mappedLectures = lectures
    .filter(lecture => lecture.archive_id === null)
    .map((lecture, i) => {
      return (
        <SecondaryButton
          key={i}
          onClick={() => setSelectedLecture(lecture)}
          isActive={selectedLecture === lecture}
        >
          <div
            dangerouslySetInnerHTML={{ __html: lecture.lecture_description }}
          />
        </SecondaryButton>
      );
    });

  const mappedRecordedLectures = lectures
    .filter(lecture => lecture.archive_id !== null)
    .map((lecture, i) => {
      return (
        <p key={i}>
          <div
            dangerouslySetInnerHTML={{ __html: lecture.lecture_description }}
          />
        </p>
      );
    });

  const startStream = async () => {
    if (Object.keys(selectedLecture).length === 0) {
      return alert("You must select a lecture to start streaming");
    } else {
      if (record) {
        const startRecording = await Axios.post(`/archive/record/start`, {
          session_id,
          lecture_id: selectedLecture.lecture_id,
          description: selectedLecture.lecture_description
        });
      }
      setPublish(true);
    }
  };

  const stopStream = async () => {
    setPublish(false);
    const stopRecording = await Axios.post(`/archive/record/stop`, {
      lecture_id: selectedLecture.lecture_id
    });
    window.location.reload();
  };

  return (
    <div className="teacherStream">
      {publish ? (
        <div className='OT-Publisher'>
          {source === "screen" ? (
            <OTPublisher
              properties={{
                width: "100%",
                height: "58vh",
                name: "Teacher",
                videoSource: "screen"
              }}
              session={sessionHelper.session}
            />
          ) : (
            <OTPublisher
              properties={{ width: "100%", height: "58vh", name: "Teacher" }}
              session={sessionHelper.session}
            />
          )}
          {mappedStreams}
          <div className="teacher-stream-buttons">
            <div className="end-lecture-button">
              <PrimaryButton onClick={stopStream}>End Lecture</PrimaryButton>
            </div>
            <div className="screen-cam-toggle">
              <SecondaryButton
                isActive={source === "screen"}
                onClick={() => setSource("screen")}
              >
                Screen
              </SecondaryButton>
              <SecondaryButton
                isActive={source === ""}
                onClick={() => setSource("")}
              >
                Camera
              </SecondaryButton>
            </div>
          </div>
        </div>
      ) : (
        <div className='not-streaming'>
          <div className='choose-source'>
            <p id='not-streaming-header'>Choose Display:</p>
            <SecondaryButton
              isActive={source === "screen"}
              onClick={() => setSource("screen")}
            >
              Screen
            </SecondaryButton>
            <SecondaryButton
              isActive={source === ""}
              onClick={() => setSource("")}
            >
              Camera
            </SecondaryButton>
          </div>
          <div className='scheduled-lectures'>
            <p id="not-streaming-header">Scheduled Lectures:</p>
            <div className="mapper">{mappedLectures}</div>
          </div>
          <div className='scheduled-lectures'>
            <p id='not-streaming-header'>Recorded Lectures:</p>
            <div className="mapper">{mappedRecordedLectures}</div>
          </div>
          <div className='scheduled-lectures'>
            <p id="not-streaming-header">Check to record this lecture</p>
            <input
              type="checkbox"
              onChange={() => setRecord(!record)}
              value={record}
            />
          </div>
          <PrimaryButton onClick={startStream}>Start Lecture</PrimaryButton>
        </div>
      )}
    </div>
  );
};

export default memo(TeacherStream);
