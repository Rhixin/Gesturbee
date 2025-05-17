import { View, Text } from "react-native";
import { WebView } from "react-native-webview";

export default function ExecuteLesson({
  title,
  prediction,
}: {
  title: string;
  prediction: string;
}) {
  return (
    <View className="w-full h-[60vh] items-center">
      <Text className="text-black text-2xl font-poppins-medium ml-2 mt-6">
        {title}
      </Text>

      {/* <View className="flex-1 w-full bg-black">
              <WebView
                source={{ uri: "https://gesturbee-app-model.vercel.app/" }}
                onMessage={(event) => {
                  const data = JSON.parse(event.nativeEvent.data);
                  console.log("📩 Received from WebView:", data);
                }}
                javaScriptEnabled={true}
                className="flex-1 bg-transparent"
              />
            </View> */}

      <View className="flex-1 w-full">
        <iframe
          src="https://gesturbee-app-model.vercel.app/"
          style={{ width: "100vw", height: "100vh", border: "none" }}
          title="Web App"
          allow="camera; microphone"
        />
      </View>

      <Text className="text-black text-2xl font-poppins-medium ml-2 mt-6">
        {prediction}
      </Text>
    </View>
  );
}
