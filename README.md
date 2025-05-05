# Jira Report

This project is a script to support reporting performance as a chart.

### Prepare assets

Open your issue in [jira.fpt.com](https://jira.fpt.com/home/issues)

1. For report log works - create query filter issue

Bug query with `created`:
```
issuetype = Bug AND createdDate >= startOfMonth() AND createdDate <= endOfMonth() AND assignee = currentUser()
```

Task query with `logWorkDate`
```
issuetype = Sub-task AND duedate >= startOfMonth() AND duedate <= endOfMonth() AND assignee = currentUser()
```

export .csv file with option `CSV (All fields)` .

![example_screen_shot](/public/images/example_1.png)

Upload your csv to file input and enjoy
---

> [!NOTE]
> I just only support **.csv** file, please do not use another type
