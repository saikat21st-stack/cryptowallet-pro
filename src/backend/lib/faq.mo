import List "mo:core/List";
import Time "mo:core/Time";
import FaqTypes "../types/faq";
import Common "../types/common";

module {
  public func seedFaq(faqs : List.List<FaqTypes.FaqEntry>) {
    // Only seed if empty
    if (faqs.size() > 0) { return };
    let seed : [(Text, Text, Text)] = [
      (
        "পেপার ট্রেডিং কী?",
        "পেপার ট্রেডিং হলো একটি সিমুলেটেড ট্রেডিং পদ্ধতি যেখানে রিয়েল অর্থ ব্যবহার না করে ভার্চুয়াল অর্থ দিয়ে ক্রিপ্টোকারেন্সি কেনা-বেচা অনুশীলন করা যায়।",
        "ট্রেডিং"
      ),
      (
        "আমার শুরু ব্যালেন্স কত?",
        "প্রতিটি নতুন অ্যাকাউন্টে $10,000 সিমুলেটেড USD দেওয়া হয় যা দিয়ে ট্রেডিং শুরু করা যায়।",
        "ট্রেডিং"
      ),
      (
        "ট্রান্সফার কি বাস্তব?",
        "না, এই অ্যাপে সমস্ত ট্রান্সফার সিমুলেটেড। রিয়েল ব্লকচেইনে কোনো ট্রানজেকশন হয় না।",
        "ট্রান্সফার"
      ),
      (
        "কোন কোন ক্রিপ্টোকারেন্সি সমর্থিত?",
        "Bitcoin (BTC), Ethereum (ETH), BNB, Solana (SOL), Dogecoin (DOGE), Tether (USDT), XRP, Cardano (ADA), Polygon (MATIC), Polkadot (DOT), Avalanche (AVAX), Chainlink (LINK), Uniswap (UNI), Cosmos (ATOM), NEAR, Fantom (FTM), Algorand (ALGO), VeChain (VET), The Sandbox (SAND), Decentraland (MANA), Shiba Inu (SHIB), এবং Litecoin (LTC) সহ ২২টি ক্রিপ্টোকারেন্সি সমর্থিত।",
        "সাধারণ"
      ),
      (
        "পাসওয়ার্ড ভুলে গেলে কী করবো?",
        "সাপোর্ট টিকেট খুলুন এবং আমাদের টিম আপনাকে সাহায্য করবে।",
        "অ্যাকাউন্ট"
      ),
      (
        "প্রাইস আপডেট কতক্ষণ পর হয়?",
        "দাম সিমুলেটেড এবং প্রতিটি API কলে র‍্যান্ডম পরিবর্তন দেখানো হয়।",
        "ট্রেডিং"
      ),
      (
        "আমার অ্যাকাউন্ট কি নিরাপদ?",
        "আপনার পাসওয়ার্ড হ্যাশ করে সংরক্ষণ করা হয়। তবে এটি একটি সিমুলেটর, তাই রিয়েল ফান্ড নেই।",
        "নিরাপত্তা"
      ),
      (
        "সাপোর্ট টিকেট কীভাবে খুলবো?",
        "মেনু থেকে 'সাপোর্ট' অপশনে যান এবং নতুন টিকেট তৈরি করুন। আমাদের টিম যত দ্রুত সম্ভব সাড়া দেবে।",
        "সাপোর্ট"
      ),
    ];
    var nextId : Nat = 0;
    for ((question, answer, category) in seed.vals()) {
      let entry : FaqTypes.FaqEntry = {
        id = nextId;
        var question;
        var answer;
        var category;
        createdAt = Time.now();
      };
      faqs.add(entry);
      nextId += 1;
    };
  };

  public func getAll(faqs : List.List<FaqTypes.FaqEntry>) : [FaqTypes.FaqEntryPublic] {
    faqs.map<FaqTypes.FaqEntry, FaqTypes.FaqEntryPublic>(func(e) { toPublic(e) }).toArray();
  };

  public func create(
    faqs : List.List<FaqTypes.FaqEntry>,
    nextId : Nat,
    req : FaqTypes.CreateFaqRequest,
    callerRole : Common.Role,
  ) : { #ok : FaqTypes.FaqEntryPublic; #err : Text } {
    switch (callerRole) {
      case (#admin) {};
      case (_) { return #err("Unauthorized") };
    };
    let entry : FaqTypes.FaqEntry = {
      id = nextId;
      var question = req.question;
      var answer = req.answer;
      var category = req.category;
      createdAt = Time.now();
    };
    faqs.add(entry);
    #ok(toPublic(entry));
  };

  public func update(
    faqs : List.List<FaqTypes.FaqEntry>,
    req : FaqTypes.UpdateFaqRequest,
    callerRole : Common.Role,
  ) : { #ok; #err : Text } {
    switch (callerRole) {
      case (#admin) {};
      case (_) { return #err("Unauthorized") };
    };
    switch (faqs.find(func(e : FaqTypes.FaqEntry) : Bool { e.id == req.id })) {
      case (?entry) {
        entry.question := req.question;
        entry.answer := req.answer;
        entry.category := req.category;
        #ok;
      };
      case null { #err("FAQ entry not found") };
    };
  };

  public func delete(
    faqs : List.List<FaqTypes.FaqEntry>,
    id : Nat,
    callerRole : Common.Role,
  ) : { #ok; #err : Text } {
    switch (callerRole) {
      case (#admin) {};
      case (_) { return #err("Unauthorized") };
    };
    // Use find to check existence, then rebuild via filter
    switch (faqs.findIndex(func(e : FaqTypes.FaqEntry) : Bool { e.id == id })) {
      case (?_idx) {
        // Retain all entries except the one with matching id
        let kept = faqs.filter(func(e : FaqTypes.FaqEntry) : Bool { e.id != id });
        faqs.clear();
        faqs.append(kept);
        #ok;
      };
      case null { #err("FAQ entry not found") };
    };
  };

  public func toPublic(entry : FaqTypes.FaqEntry) : FaqTypes.FaqEntryPublic {
    {
      id = entry.id;
      question = entry.question;
      answer = entry.answer;
      category = entry.category;
      createdAt = entry.createdAt;
    };
  };
};
