// based on whatever in backend
export interface JwtPayload {
  data: {
    userId: string;
    role: string;
  };
  iat: number;
  exp: number;
}

export default function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload) as JwtPayload;

  } catch (error) {
    console.log(error)
    console.log("error occur in jwt verfication")
    return null
  }
}






// THEORY: 
// you know that jwt has 3 part header payload and signature 
// we are intrested in signature therefore split(".")[0]
// then we convert the url safe base64 into actual base64 
// then we use the browser native atob function to convert into string
// the map work around is used if the unicode chacter like emoji occur the atob break
//





// what is base64
// Base64 is a binary-to-text encoding scheme that converts binary data (like images or encrypted data) into a printable ASCII string, making it safe to transmit over systems that might otherwise break or alter the data.
