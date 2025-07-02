// Chakra UI kütüphanesinden gerekli bileşenleri import ediyoruz.
// Stack: Bileşenleri dikey veya yatay olarak yığınlamak için kullanılır.
import { Stack } from "@chakra-ui/layout";
// Skeleton: Veri yüklenirken içeriğin yerini belli eden bir "iskelet" (placeholder) gösterir.
import { Skeleton } from "@chakra-ui/skeleton";

// `ChatLoading` bileşeni, sohbet listesi gibi veriler yüklenirken kullanıcıya
// bir yükleme animasyonu göstermek için kullanılır.
const ChatLoading = () => {
  return (
    // `Stack` bileşeni, içindeki `Skeleton`'ları dikey olarak alt alta sıralar.
    <Stack>
      {/*
        Her bir `Skeleton` bileşeni, yüklenecek olan bir sohbet öğesinin yer tutucusudur.
        `height="45px"` prop'u ile her bir iskeletin yüksekliğini belirliyoruz.
        Bu, gerçek içerik geldiğinde sayfa düzeninin bozulmasını engeller ve
        kullanıcıya tutarlı bir görsel deneyim sunar.
      */}
      <Skeleton height="45px" />
      <Skeleton height="45px" />
      <Skeleton height="45px" />
      <Skeleton height="45px" />
      <Skeleton height="45px" />
      <Skeleton height="45px" />
      <Skeleton height="45px" />
      <Skeleton height="45px" />
      <Skeleton height="45px" />
      <Skeleton height="45px" />
      <Skeleton height="45px" />
      <Skeleton height="45px" />
    </Stack>
  );
};

// Bileşeni, diğer dosyalarda kullanılabilmesi için dışa aktarıyoruz.
export default ChatLoading;
