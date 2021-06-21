// Config para o typescript aceitar importação de imagem.

declare module '*.png' {
  const content: any;
  export default content;
}

// declare module 'react-native-push-notification' {
//   const notifications: ;
//   export default notifications;
// }
