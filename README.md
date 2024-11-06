# Jira Report

This project is a script to support reporting performance as a chart.

### Prepare assets

Open your issue in [jira.fpt.com](https://jira.fpt.com/home/issues)

1. For report log works - create query filter issue

```javascript
issuetype = <type> AND created >= <start_date> AND created <= <end_date> AND assignee = currentUser()
```

example:
```
issuetype = Sub-task AND created >= 2024-10-1 AND created <= 2024-10-31 AND assignee = currentUser()
```

export .csv file with option `CSV (All fields)` .

![example_screen_shot](/public/images/example_1.png)

Upload your csv to file input and enjoy

> [!NOTE]
> I just only support **.csv** file, please do not use another type