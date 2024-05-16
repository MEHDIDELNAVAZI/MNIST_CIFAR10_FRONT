import { useState, ChangeEvent, useEffect } from "react";
import axios from "axios";

function App(): JSX.Element {
  const [mnistFile, setMnistFile] = useState<File | null>(null);
  const [mnistPrediction, setMnistPrediction] = useState<string | null>(null);
  const [cifarprediction, setcifarprediction] = useState<string | null>(null);
  const [mnistPreview, setMnistPreview] = useState<string | ArrayBuffer | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalstatus, setmodalstatus] = useState<string>("");

  function cifar10Label(index: any) {
    const labels = [
      "Airplane",
      "Automobile",
      "Bird",
      "Cat",
      "Deer",
      "Dog",
      "Frog",
      "Horse",
      "Ship",
      "Truck",
    ];

    if (index >= 0 && index < labels.length) {
      return labels[index];
    } else {
      return "Invalid index";
    }
  }

  const [_, setModalContent] = useState<{
    image: any;
    prediction: any;
  }>({
    image: null,
    prediction: null,
  });

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const [mnistLoading, setMnistLoading] = useState<boolean>(false);
  const [imageuri, setimageuri] = useState<string>("");

  const [customFile, setCustomFile] = useState<File | null>(null);
  const [customPreview, setCustomPreview] = useState<
    string | ArrayBuffer | null
  >(null);
  const [customLoading, setCustomLoading] = useState<boolean>(false);

  const handleMnistFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    if (event.target.files && event.target.files.length > 0) {
      setMnistPrediction("");
      const file = event.target.files[0];
      setMnistFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMnistPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleCustomFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setCustomFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMnistUpload = (): void => {
    setIsModalOpen(true);
    setmodalstatus("mnist");
    if (!mnistFile) return;
    setMnistLoading(true);
    const formData = new FormData();
    formData.append("image", mnistFile);

    axios
      .post<{ prediction: string; image_base64: string }>(
        "http://127.0.0.1:9001/mnist_predict",
        formData
      )
      .then((response) => {
        setMnistPrediction(response.data.prediction);
        setimageuri(response.data.image_base64);
        setModalContent({
          image: response.data.image_base64,
          prediction: response.data.prediction,
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      })
      .finally(() => {
        setMnistLoading(false);
      });
  };

  const handlecustomUpload = (): void => {
    setIsModalOpen(true);
    setmodalstatus("cifra");
    if (!customFile) return;
    const formData = new FormData();
    formData.append("image", customFile);

    axios
      .post<{ prediction: string; image_base64: string }>(
        "http://127.0.0.1:9001/cifar10_predict",
        formData
      )
      .then((response) => {
        setcifarprediction(response.data.prediction);
        setimageuri(response.data.image_base64);
        setModalContent({
          image: response.data.image_base64,
          prediction: response.data.prediction,
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      })
      .finally(() => {
        setCustomLoading(false);
      });
  };

  useEffect(() => {
    return () => {
      console.log(imageuri);
    };
  }, [imageuri]);

  return (
    <div
      style={{
        margin: "auto",
        justifyContent: "center",
        display: "flex",
        gap: 100,
      }}
    >
      <div>
        <div style={{}}>
          {isModalOpen && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  background: "#fff",
                  padding: "5px",
                  borderRadius: "5px",
                  textAlign: "center",
                  position: "relative",
                  width: 300,
                  height: "auto",
                }}
              >
                <button
                  onClick={closeModal}
                  style={{
                    position: "absolute",
                    top: "0px",
                    right: "0px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "black",
                  }}
                >
                  <p>Close</p>
                </button>
                <img
                  src={
                    modalstatus == "mnist"
                      ? (mnistPreview as string)
                      : (customPreview as string)
                  }
                  alt="Prediction Preview"
                  style={{ width: 200, height: "auto" }}
                />

                <p
                  style={{
                    color: "black",
                  }}
                >
                  We Predict that this is ={" "}
                  {modalstatus === "mnist"
                    ? mnistPrediction
                    : cifar10Label(cifarprediction)}
                </p>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: "20px" }} className="flex">
          <h2>MNIST Model</h2>
          <input type="file" onChange={handleMnistFileChange} />
          <br />
          <br />
          <br />

          {mnistPreview && (
            <img
              src={mnistPreview as string}
              alt="MNIST Preview"
              style={{ maxWidth: "200px" }}
            />
          )}
          <br />
          <br />

          <button onClick={handleMnistUpload} disabled={mnistLoading}>
            {mnistLoading ? "Uploading..." : "Predict"}
          </button>
        </div>
      </div>

      <div style={{}}>
        <div style={{ marginBottom: "20px" }} className="flex">
          <h2>CIFAR10 Model</h2>
          <input type="file" onChange={handleCustomFileChange} />
          <br />
          <br />
          <br />

          {customPreview && (
            <img
              src={customPreview as string}
              alt="MNIST Preview"
              style={{ maxWidth: "200px" }}
            />
          )}
          <br />
          <br />
          <button
            onClick={() => {
              handlecustomUpload();
            }}
            disabled={customLoading}
          >
            {customLoading ? "Uploading..." : "Predict"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
