(() => {
  const tg = window.Telegram && window.Telegram.WebApp;
  const status = document.getElementById("statusText");
  const modeText = document.getElementById("modeText");
  const queryLaunch = Boolean(
    tg && tg.initDataUnsafe && tg.initDataUnsafe.query_id
  );

  const setStatus = (text) => {
    status.textContent = text;
  };

  if (tg) {
    tg.ready();
    tg.expand();
    if (queryLaunch) {
      modeText.textContent = "Открыто не через командную кнопку";
      setStatus("Открой Mini App нижней кнопкой CRAB в чате");
    } else {
      modeText.textContent = "Подключено к Telegram";
      setStatus("Готов к командам");
    }
    if (tg.setHeaderColor) tg.setHeaderColor("#0b1017");
    if (tg.setBackgroundColor) tg.setBackgroundColor("#0b1017");
  } else {
    modeText.textContent = "Локальный предпросмотр";
    setStatus("Telegram WebApp API недоступен");
  }

  const commandMap = {
    status: "/status",
    task: "/task",
    results: "/results",
    ai: "/ai",
    pause: "/pause",
    manage: "/manage"
  };

  const send = (action) => {
    const command = commandMap[action];
    if (!command) return;

    if (!tg) {
      setStatus("Предпросмотр: " + command);
      return;
    }
    if (queryLaunch || typeof tg.sendData !== "function") {
      if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred("error");
      setStatus("Команды доступны только из нижней Mini App-кнопки в чате");
      return;
    }

    try {
      if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred("light");
      tg.sendData(JSON.stringify({
        v: 1,
        source: "crab-miniapp",
        action,
        command
      }));
      setStatus("Команда передана: " + command);
    } catch (error) {
      setStatus("Не удалось передать команду");
    }
  };

  document.querySelectorAll("[data-action]").forEach((button) => {
    if (queryLaunch) button.disabled = true;
    button.addEventListener("click", () => send(button.dataset.action));
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && tg && tg.HapticFeedback) {
      tg.HapticFeedback.selectionChanged();
    }
  });
})();
