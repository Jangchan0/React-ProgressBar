import React, { useState, useRef } from "react";
import styled from "styled-components";
import axios from "axios";
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://172.30.1.1:3000/files/progress";

const Progress = () => {
  const url = "http://172.30.1.1:3000/files/progress";

  const [files, setFile] = useState([]);
  const uploadRef = useRef();
  const statusRef = useRef();
  const loadTotalRef = useRef();
  const progressRef = useRef();

  const [content, setContent] = useState(0);

  const source = axios.CancelToken.source(); // axios의 데이터 전송 취소 명령어

  let formData = new FormData();

  const changeFile = () => {
    let newFiles = [];
    if (uploadRef.current.files.length === 0) {
      return;
    }
    for (let i = 0; i < uploadRef.current.files.length; i++) {
      const file = uploadRef.current.files[i];
      newFiles.push(file);

      formData.append("originalname", file.name); // 선택된 파일을 formData에 추가
      formData.append("files", file); // 반복문을 활용하여 파일들을 formData 객체에 추가한다
      formData.append("mimetype", file.type); // 선택된 파일을 formData에 추가
      formData.append("totalAmountData", file.size); // 보내는 데이터의 총량 (bytes)
    }
    setFile(newFiles);
  };

  const postContents = () => {
    axios({
      url: url,
      method: "post",
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        // axios의 onUploadProgress 속성은 파일 업로드 진행 상황을 추적할 수 있는 콜백 함수
        let percent = (e.loaded / e.total) * 100;
        progressRef.current.value = Math.round(percent);
        statusRef.current.innerHTML = `${Math.round(percent)}% uploaded...`;
        setContent(progressRef.current.value);
        loadTotalRef.current.innerHTML = `uploaded ${e.loaded} bytes of ${e.total}`;
      },
      cancelToken: source.token,
    })
      .then((response) => {
        console.log("Upload success", response);
        alert(response.data.message);
        statusRef.current.innerHTML = "Upload success!!";
        // progressRef.current.value = 0; // 전송 후 초기상태로 돌려두기
        // progressRef.current.style.width = "0%";
        // setContent(0);
      })
      .catch((error) => {
        console.log("Upload failed", error);
        statusRef.current.innerHTML = "Upload failed";
      });
  };

  const AbortHandler = () => {
    source.cancel(); // axios 데이터 전송 중단토큰 (서버와 합의 필요!)
    console.log("Upload aborted");
    statusRef.current.innerHTML = "Upload aborted";
  };

  console.log(files);

  return (
    <div
      className="App"
      style={{
        margin: "300px auto",
        backgroundColor: "#c0c0c0",
        width: "700px",
        padding: "100px",
        borderRadius: "85px",
      }}
    >
      <input
        type="file"
        multiple={true}
        name="file"
        ref={uploadRef}
        onChange={changeFile}
      />
      <label
        style={{
          display: "flex",
          justifyContent: "center",
          position: "relative",
          top: "15px",
        }}
      >
        File progress:
        <ProgressWrapper>
          <ProgressPercent ref={progressRef} width={`${content}%`} />
        </ProgressWrapper>
      </label>

      <p ref={statusRef} />
      <p ref={loadTotalRef} />

      {files.length >= 1 && // 선택된 파일들의 이름을 출력
        files.map((value, i) => {
          return <div key={i}> {value.name} </div>;
        })}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <button
          onClick={postContents}
          style={{
            width: " 100px",
            height: "50px",
            fontSize: "16px",
          }}
        >
          전송
        </button>
        <button
          onClick={AbortHandler}
          style={{
            width: " 100px",
            height: "50px",
            fontSize: "16px",
          }}
        >
          중단
        </button>
      </div>
    </div>
  );
};

export default Progress;

const ProgressWrapper = styled.div`
  width: 500px;
  height: 20px;
  background-color: white;
  margin: 3px 0 20px 10px;
  border-radius: 15px;
`;

const ProgressPercent = styled.div`
  width: ${(props) => props.width};
  height: 100%;
  border-radius: 15px;
  background-color: lightblue;
`;
