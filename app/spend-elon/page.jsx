"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Head from "next/head"
import Image from "next/image"
import html2canvas from "html2canvas"

// Format money with K, M, B suffixes
export function formatMoney(amount) {
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(2)}B`
  } else if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(2)}K`
  } else {
    return `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`
  }
}

// Format money with commas for detailed view
export function formatMoneyFull(amount) {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

// Initial Elon's money in dollars
const INITIAL_MONEY = 486400000000

// Item data with replacements as requested
const items = [
  { id: 1, name: "Big Mac", price: 2, image: "big-mac.png" },
  { id: 2, name: "McFlurry", price: 4, image: "mcflurry.png" },
  { id: 3, name: "Twitter Blue Checkmark", price: 8, image: "verified-check.png" },
  { id: 4, name: "Uber Ride", price: 25, image: "uber.png" },
  { id: 5, name: "Hoodie", price: 60, image: "hoodie.png" },
  { id: 6, name: "Dogecoin (1k coins)", price: 75, image: "dogecoin.png" },
  { id: 7, name: "Netflix Gift Card", price: 100, image: "netflix-card.png" },
  { id: 8, name: "Mars Dirt Sample", price: 100, image: "mars-dirt.png" },
  { id: 9, name: "Premium Spotify", price: 120, image: "spotify-premium.png" },
  { id: 10, name: "Concert Ticket", price: 120, image: "concert-ticket.png" },
  { id: 11, name: "Grocery Trip (1 week)", price: 150, image: "groceries.png" },
  { id: 12, name: "Tesla Hat", price: 150, image: "tesla-hat.png" },
  { id: 13, name: "Netflix Subscription (1 yr)", price: 180, image: "netflix.png" },
  { id: 14, name: "AirPods", price: 249, image: "airpods.png" },
  { id: 15, name: "Nintendo Switch", price: 300, image: "nintendo-switch.png" },
  { id: 16, name: "Supreme Brick", price: 300, image: "supreme-brick.png" },
  { id: 17, name: "School Textbooks", price: 400, image: "textbooks.png" },
  { id: 18, name: "Starlink Dish", price: 499, image: "starlink-dish.png" },
  { id: 19, name: "Playstation 5", price: 499, image: "ps5.png" },
  { id: 20, name: "Gym Membership (1 year)", price: 500, image: "gym-membership.png" },
  { id: 21, name: "Steam Deck OLED", price: 590, image: "steamdeck.png" },
  { id: 22, name: "Flamethrower", price: 600, image: "flamethrower.png" },
  { id: 23, name: "Mars Passport", price: 999, image: "mars-passport.png" },
  { id: 24, name: "IKEA Furniture Set", price: 1000, image: "ikea-set.png" },
  { id: 25, name: "iPhone 15 Pro", price: 1200, image: "iphone-15.png" },
  { id: 26, name: "DSLR Camera", price: 1200, image: "dslr-camera.png" },
  { id: 27, name: "Office Chair (Herman Miller)", price: 1800, image: "herman-miller.png" },
  { id: 28, name: "Balenciaga Trash Bag", price: 1800, image: "balenciaga-bag.png" },
  { id: 29, name: "MacBook Pro", price: 2000, image: "macbook.png" },
  { id: 30, name: "Gaming PC", price: 2500, image: "gaming-pc.png" },
  { id: 31, name: "Apple Vision Pro", price: 3500, image: "vision-pro.png" },
  { id: 32, name: "Gucci Tracksuit", price: 5000, image: "gucci-tracksuit.png" },
  { id: 33, name: "First Class Emirates Flight", price: 8000, image: "emirates-first.png" },
  { id: 34, name: "Tesla Cyberquad for Adults", price: 8000, image: "cyberquad.png" },
  { id: 35, name: "Indoor Go-Kart Track (1 Day)", price: 15000, image: "go-kart-track.png" },
  { id: 36, name: "Racing Simulator Rig", price: 20000, image: "racing-sim.png" },
  { id: 37, name: "F1 Pit Crew for a Day", price: 20000, image: "f1-pitcrew.png" },
  { id: 38, name: "Dior Air Jordan 1s", price: 20000, image: "dior-aj1.png" },
  { id: 39, name: "BMW S1000RR", price: 24000, image: "bmw-s1000rr.png" },
  { id: 40, name: "Louis Vuitton Travel Set", price: 35000, image: "lv-travel-set.png" },
  { id: 41, name: "Tesla Model 3", price: 40000, image: "tesla-model-3.png" },
  { id: 42, name: "Cartier Love Bracelet (Diamond)", price: 50000, image: "cartier-bracelet.png" },
  { id: 43, name: "F1 Steering Wheel", price: 70000, image: "f1-steering-wheel.png" },
  { id: 44, name: "Cybertruck", price: 80000, image: "cybertruck.png" },
  { id: 45, name: "Tesla Model S Plaid", price: 90000, image: "tesla-model-s.png" },
  { id: 46, name: "Custom Diamond Grillz", price: 90000, image: "grillz.png" },
  { id: 47, name: "Supreme x Louis Vuitton Trunk", price: 100000, image: "lv-trunk.png" },
  { id: 48, name: "Tesla Semi Truck", price: 150000, image: "tesla-semi.png" },
  { id: 49, name: "F1 Race Weekend (VIP)", price: 150000, image: "f1-vip-pass.png" },
  { id: 50, name: "Chanel Haute Couture Gown", price: 200000, image: "chanel-gown.png" },
  { id: 51, name: "Luxury Motorhome (Class A RV)", price: 220000, image: "luxury-rv.png" },
  { id: 52, name: "Neuralink Implant", price: 250000, image: "neuralink.png" },
  { id: 53, name: "Lamborghini Urus", price: 250000, image: "urus.png" },
  { id: 54, name: "Richard Mille RM 11-03", price: 450000, image: "richard-mille.png" },
  { id: 55, name: "Meme NFT", price: 500000, image: "meme-nft.png" },
  { id: 56, name: "Hermès Birkin Bag (Crocodile Skin)", price: 500000, image: "birkin-bag.png" },
  { id: 57, name: "Rolls Royce Phantom", price: 500000, image: "rolls-phantom.png" },
  { id: 58, name: "Lamborghini Revuelto", price: 600000, image: "lamborghini.png" },
  { id: 59, name: "Rolex Daytona Rainbow", price: 650000, image: "rolex-daytona.png" },
  { id: 60, name: "Ferrari SF90 Stradale", price: 700000, image: "ferrari-sf90.png" },
  { id: 61, name: "X.com Domain", price: 1000000, image: "x-com.png" },
  { id: 62, name: "Airplane Hangar (1 Year Rent)", price: 1000000, image: "airplane-hangar.png" },
  { id: 63, name: "Times Square Billboard (1 Month)", price: 1500000, image: "times-square.png" },
  { id: 64, name: "Super Bowl Ad", price: 5000000, image: "superbowl-ad.png" },
  { id: 65, name: "F1 Car (Mercedes W14)", price: 16000000, image: "f1-car.png" },
  { id: 66, name: "Private Island", price: 65000000, image: "private-island.png" },
  { id: 67, name: "Private Jet", price: 70000000, image: "private-jet.png" },
  { id: 68, name: "Falcon 9 Launch", price: 70000000, image: "falcon9.png" },
  { id: 69, name: "Island + Mansion", price: 250000000, image: "privatem-island.png" },
  { id: 70, name: "Custom Mega Yacht", price: 300000000, image: "mega-yacht.png" },
  { id: 71, name: "Boeing 747‑8", price: 315000000, image: "boeing-747.png" },
  { id: 72, name: "Buy Reddit", price: 8000000000, image: "reddit.png" },
  { id: 73, name: "Buy Twitter (again)", price: 44000000000, image: "twitter.png" },
  { id: 74, name: "Elon's Ego (can't remove)", price: 1, image: "ego.png" },
  { id: 75, name: "Buy Mars (locked)", price: 999999999999, image: "mars-locked.png" },
]

// Animation duration for money counter
const ANIMATION_DURATION = 1000 // ms

export default function SpendElonsMoney() {
  const [cart, setCart] = useState({})
  const [money, setMoney] = useState(INITIAL_MONEY)
  const [displayMoney, setDisplayMoney] = useState(INITIAL_MONEY)
  const [showReceipt, setShowReceipt] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [quantities, setQuantities] = useState({})
  const [elonsEgoPurchased, setElonsEgoPurchased] = useState(false)
  const [isExportMode, setIsExportMode] = useState(false)
  const receiptRef = useRef(null)
  const moneyAnimationRef = useRef(null)

  // Initialize cart with zero quantities
  useEffect(() => {
    const initialCart = {}
    const initialQuantities = {}
    items.forEach((item) => {
      initialCart[item.id] = 0
      initialQuantities[item.id] = ""
    })
    setCart(initialCart)
    setQuantities(initialQuantities)

    // Check for dark mode preference
    if (typeof window !== "undefined") {
      const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDarkMode(darkModePreference)

      // Add listener for changes
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = (e) => setIsDarkMode(e.matches)
      mediaQuery.addEventListener("change", handleChange)

      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  // Animate money changes
  useEffect(() => {
    if (moneyAnimationRef.current) {
      clearInterval(moneyAnimationRef.current)
    }

    const startValue = displayMoney
    const endValue = money
    const diff = endValue - startValue
    const steps = 20
    const stepValue = diff / steps
    let currentStep = 0

    moneyAnimationRef.current = setInterval(() => {
      currentStep++
      if (currentStep >= steps) {
        setDisplayMoney(endValue)
        clearInterval(moneyAnimationRef.current)
      } else {
        setDisplayMoney(Math.round(startValue + stepValue * currentStep))
      }
    }, ANIMATION_DURATION / steps)

    return () => {
      if (moneyAnimationRef.current) {
        clearInterval(moneyAnimationRef.current)
      }
    }
  }, [money])

  // Calculate total spent
  const totalSpent = INITIAL_MONEY - money

  // Handle buying an item
  const handleBuy = (itemId, price, quantity = 1) => {
    // Parse the quantity as an integer, defaulting to 1 if invalid
    const buyQuantity = Number.parseInt(quantity, 10) || 1

    if (buyQuantity <= 0) return // Prevent negative purchases

    const totalCost = price * buyQuantity

    if (money >= totalCost) {
      // User has enough money for the full quantity
      setCart((prev) => {
        const newCart = {
          ...prev,
          [itemId]: (prev[itemId] || 0) + buyQuantity,
        }

        // Check if Elon's Ego is being purchased
        if (itemId === 74 && newCart[itemId] > 0) {
          setElonsEgoPurchased(true)
        }

        return newCart
      })
      setMoney((prev) => prev - totalCost)
    } else {
      // If not enough money, buy as many as possible
      const maxPossible = Math.floor(money / price)
      if (maxPossible > 0) {
        setCart((prev) => {
          const newCart = {
            ...prev,
            [itemId]: (prev[itemId] || 0) + maxPossible,
          }

          // Check if Elon's Ego is being purchased
          if (itemId === 74 && newCart[itemId] > 0) {
            setElonsEgoPurchased(true)
          }

          return newCart
        })
        setMoney((prev) => prev - price * maxPossible)
      }
    }

    // Reset quantity input after purchase
    setQuantities((prev) => ({
      ...prev,
      [itemId]: "",
    }))
  }

  // Handle selling an item
  const handleSell = (itemId, price, quantity = 1) => {
    // Don't allow selling Elon's Ego once purchased
    if (itemId === 74 && elonsEgoPurchased) {
      return
    }

    // Parse the quantity as an integer, defaulting to 1 if invalid
    const sellQuantity = Number.parseInt(quantity, 10) || 1

    if (sellQuantity <= 0) return // Prevent negative sales

    // Don't allow selling more than owned
    const actualSellQuantity = Math.min(sellQuantity, cart[itemId] || 0)

    if (actualSellQuantity > 0) {
      setCart((prev) => ({
        ...prev,
        [itemId]: prev[itemId] - actualSellQuantity,
      }))
      setMoney((prev) => prev + price * actualSellQuantity)
    }

    // Reset quantity input after sale
    setQuantities((prev) => ({
      ...prev,
      [itemId]: "",
    }))
  }

  // Handle quantity change
  const handleQuantityChange = (itemId, value) => {
    // Remove leading zero if present
    if (value.startsWith("0") && value.length > 1) {
      value = value.substring(1)
    }

    // Only allow numbers
    if (value === "" || /^\d+$/.test(value)) {
      // Update the input field value
      setQuantities((prev) => ({
        ...prev,
        [itemId]: value,
      }))
    }
  }

  // Reset everything
  const handleReset = () => {
    setCart({})
    setMoney(INITIAL_MONEY)
    setDisplayMoney(INITIAL_MONEY)
    setElonsEgoPurchased(false)

    const initialQuantities = {}
    items.forEach((item) => {
      initialQuantities[item.id] = ""
    })
    setQuantities(initialQuantities)
  }

  // Save receipt as image
  const saveReceiptAsImage = () => {
    // Enable export mode for cleaner receipt
    setIsExportMode(true)

    setTimeout(() => {
      if (receiptRef.current) {
        html2canvas(receiptRef.current, {
          backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
          scale: 2, // Higher resolution
        }).then((canvas) => {
          const image = canvas.toDataURL("image/png")
          const link = document.createElement("a")
          link.href = image
          link.download = "elon-money-receipt.png"
          link.click()

          // Disable export mode after download
          setTimeout(() => {
            setIsExportMode(false)
          }, 500)
        })
      }
    }, 100)
  }

  // Get purchased items for receipt
  const purchasedItems = items.filter((item) => cart[item.id] > 0)

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <div className="dark:bg-gray-900 bg-gray-50 min-h-screen pb-24">
        <Head>
          <link rel="icon" href={isDarkMode ? "/SimLD.png" : "/SimL.png"} />
          <title>Spend Elon&apos;s Money | RandomSh!t Lab</title>
        </Head>

        {/* Header - Money Remaining */}
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-md py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-center mb-2">
              <h1 className="text-3xl md:text-4xl font-bold text-center">Spend Elon&apos;s Money</h1>
              <div className="w-12 h-12 relative mt-2">
                <Image
                  src="/images/spend-elon/elon-face.png"
                  alt="Elon Musk"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
            </div>
            <div className="text-4xl md:text-5xl font-bold text-green-600 dark:text-green-400 text-center">
              {formatMoneyFull(displayMoney)} Remaining
            </div>
          </div>
        </header>

        {/* Main Content - Item Grid */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                quantity={cart[item.id] || 0}
                quantityInput={quantities[item.id] || ""}
                onQuantityChange={(value) => handleQuantityChange(item.id, value)}
                onBuy={(quantity) => handleBuy(item.id, item.price, quantity)}
                onSell={(quantity) => handleSell(item.id, item.price, quantity)}
                canBuy={money >= item.price}
                canSell={cart[item.id] > 0}
                isElonsEgoPurchased={item.id === 74 && elonsEgoPurchased}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        </main>

        {/* Footer - Total Spent & Receipt */}
        <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-xl font-bold mb-2 md:mb-0">
                Total Spent: <span className="text-red-600 dark:text-red-400">{formatMoney(totalSpent)}</span>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowReceipt(!showReceipt)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {showReceipt ? "Hide Receipt" : "View Receipt"}
                </button>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
              Created by Karman B, Ishvir C, and David Y | Inspired by Neal Agarwal
            </div>
          </div>
        </footer>

        {/* Receipt Modal */}
        <AnimatePresence>
          {showReceipt && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReceipt(false)}
            >
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6" ref={receiptRef}>
                  <div className="flex items-center justify-center mb-4">
                    <h2 className="text-2xl font-bold text-center">Your Receipt</h2>
                    <div className="w-10 h-10 relative ml-2">
                      <Image
                        src="/images/spend-elon/elon-face.png"
                        alt="Elon Musk"
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {purchasedItems.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 my-8">
                      You haven&apos;t bought anything yet!
                    </p>
                  ) : (
                    <>
                      <div className="space-y-4 mb-6">
                        {purchasedItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center border-b pb-2 dark:border-gray-700"
                          >
                            <span>
                              {item.name} × {cart[item.id]}
                            </span>
                            <span className="font-medium">{formatMoney(item.price * cart[item.id])}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between text-xl font-bold pt-4 border-t dark:border-gray-700">
                        <span>Total:</span>
                        <span>{formatMoney(totalSpent)}</span>
                      </div>

                      <div className="mt-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                        {formatMoney(INITIAL_MONEY - totalSpent)} remaining of {formatMoney(INITIAL_MONEY)}
                      </div>
                    </>
                  )}

                  {!isExportMode && (
                    <div className="mt-6 flex justify-center space-x-4">
                      <button
                        onClick={() => setShowReceipt(false)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        Close
                      </button>
                      {purchasedItems.length > 0 && (
                        <button
                          onClick={saveReceiptAsImage}
                          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                          Save Receipt
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Item Card Component
function ItemCard({
  item,
  quantity,
  quantityInput,
  onQuantityChange,
  onBuy,
  onSell,
  canBuy,
  canSell,
  isElonsEgoPurchased,
  isDarkMode,
}) {
  const [isHovered, setIsHovered] = useState(false)

  // Special case for "Elon's Ego" which can't be removed once purchased
  const isElonsEgo = item.id === 74

  // Special case for "Buy Mars" which is locked
  const isMarsLocked = item.id === 75

  return (
    <motion.div
      className={`
       rounded-xl overflow-hidden shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
       ${isHovered ? "shadow-lg" : "shadow-md"} transition-shadow
     `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="p-4">
        <div className="w-full h-40 relative mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          <Image src={`/images/spend-elon/${item.image}`} alt={item.name} fill className="object-contain p-2" />
        </div>

        <h3 className="text-lg font-semibold text-center mb-1">{item.name}</h3>

        <p className="text-xl font-bold text-center text-green-600 dark:text-green-400 mb-4">
          {formatMoney(item.price)}
        </p>

        <div className="flex-1 mb-2">
          <input
            type="text"
            value={quantityInput}
            onChange={(e) => onQuantityChange(e.target.value)}
            placeholder={quantity.toString()}
            className="w-full h-10 text-center font-bold text-xl bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
            disabled={isMarsLocked}
          />
        </div>

        <div className="flex justify-between items-center mt-2">
          <button
            onClick={() => onSell(quantityInput)}
            disabled={!canSell || (isElonsEgo && isElonsEgoPurchased)}
            className={`
             flex-1 h-10 rounded-lg font-bold text-sm flex items-center justify-center mr-2
             ${canSell && !(isElonsEgo && isElonsEgoPurchased) ? "bg-red-500 hover:bg-red-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"}
             transition-colors
           `}
          >
            Sell
          </button>

          <button
            onClick={() => onBuy(quantityInput)}
            disabled={!canBuy || isMarsLocked}
            className={`
             flex-1 h-10 rounded-lg font-bold text-sm flex items-center justify-center
             ${canBuy && !isMarsLocked ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"}
             transition-colors
           `}
          >
            Buy
          </button>
        </div>
      </div>
    </motion.div>
  )
}
