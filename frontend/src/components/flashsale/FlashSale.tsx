import { useState, useEffect } from "react";
import PurchaseProgress from "../chart/purchaseprogress";
import { fetchAllSeckillProducts, panicBuyProduct } from "../../utils/api";

const FlashSale = () => {
  const [seckillProducts, setSeckillProducts] = useState([]);
  useEffect(() => {
    const loadSeckillProducts = async () => {
      const products = await fetchAllSeckillProducts();
      setSeckillProducts(products);
      console.log(products)
    };
    loadSeckillProducts();
  }, []);
  const handleBuy = async (productName: string) => {
    const userName = "您的用戶名";
    const message = await panicBuyProduct(userName, productName);
    alert(message);
  };
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const targetDate = new Date("2024-01-06").getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      // 計算剩餘時間
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      // 更新狀態
      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    // 組件卸載時清除計時器
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-[60rem] m-auto mb-[3.063rem]">
      <div className="flex flex-row items-center justify-center mt-10">
        <p className="flex flex-col text-[50px] text-center font-bold leading-6">
          Fashion Day Flash
        </p>
        &nbsp;&nbsp;
        <p className="text-red-600 flex flex-col text-[50px] text-center font-bold leading-6">
          Sale
        </p>
      </div>
      <div className="flex flex-row items-center justify-center mt-10">
        <div className="flex flex-row gap-3">
          <div className="w-[100px] h-[100px] flex-shrink-0 border border-black bg-white rounded-[15px] flex flex-col items-center justify-center">
            <p className="text-3xl font-bold">{timeLeft.days}</p>
            <p>Days</p>
          </div>
          <div className="w-[100px] h-[100px] flex-shrink-0 border border-black bg-white rounded-[15px] flex flex-col items-center justify-center">
            <p className="text-3xl font-bold">{timeLeft.hours}</p>
            <p>Hours</p>
          </div>
          <div className="w-[100px] h-[100px] flex-shrink-0 border border-black bg-white rounded-[15px] flex flex-col items-center justify-center">
            <p className="text-3xl font-bold">{timeLeft.minutes}</p>
            <p>Mins</p>
          </div>
          <div className="w-[100px] h-[100px] flex-shrink-0 border border-black bg-white rounded-[15px] flex flex-col items-center justify-center">
            <p className="text-3xl font-bold">{timeLeft.seconds}</p>
            <p>Secs</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 items-center justify-center">
        {seckillProducts.map((product) => (
          <div className="w-[800px] h-[300px] flex-shrink-0 bg-[#FBFBFB] rounded-[20px] border mt-5 flex flex-row">
            <div className="flex items-center">
              <img
                src={product.picture}
                alt="product"
                className="w-[250px] h-[250px] object-cover"
              />
            </div>
            <div className="flex flex-col relative">
              <p className=" flex-shrink-0 text-black font-bold text-[1.5rem] leading-[2.375rem] tracking-[0.4rem] font-[Noto Sans TC]> mt-5 ml-5">
                {product.name}
              </p>
              <div className="flex flex-row">
                <p className="flex-shrink-0 text-black font-bold text-[1.5rem] leading-[2.375rem]   mt-2 ml-5">
                  {product.price}
                </p>
                <p className="flex-shrink-0 text-[#939393] font-bold text-[1.5rem] leading-[2.375rem] line-through mt-2 ml-5">
                  ${parseInt(product.price) + 100}
                </p>
              </div>
              <div className="w-[270px] h-[100px] ml-5">
                <PurchaseProgress purchased={50} remaining={50} />
              </div>
              <p className="flex-shrink-0 text-black font-bold text-[1.5rem] leading-[2.375rem]   mt-2 ml-5">
                僅剩50件商品!!
              </p>
              <button
                onClick={() => handleBuy(product.name)}
                className="w-[5.5rem] h-[5.5rem] flex-shrink-0 bg-white border border-black text-black rounded-full absolute left-[25rem] top-[12rem]"
              >
                Buy
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashSale;